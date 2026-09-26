import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const USER_AGENT = "GGM-Technologies-Demo-Builder/1.0";
const RAW_DIR = path.join(process.cwd(), "data", "raw");

const lastRequestAt = new Map<string, number>();
const MIN_INTERVAL_MS = 1000;

function cacheKeyFor(url: string): string {
  return crypto.createHash("sha1").update(url).digest("hex");
}

async function throttle(host: string) {
  const last = lastRequestAt.get(host) ?? 0;
  const wait = MIN_INTERVAL_MS - (Date.now() - last);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt.set(host, Date.now());
}

export interface FetchOptions {
  brand: string;
  kind: "json" | "text";
  retries?: number;
}

/**
 * Cached, rate-limited (1 req/sec/domain) fetch with retry+backoff.
 * Every response is cached to /data/raw/<brand>/<hash>.json so re-runs never re-hit the sites.
 */
export async function politeFetch<T = unknown>(url: string, opts: FetchOptions): Promise<T | null> {
  const cacheDir = path.join(RAW_DIR, opts.brand, "_cache");
  await mkdir(cacheDir, { recursive: true });
  const cacheFile = path.join(cacheDir, `${cacheKeyFor(url)}.json`);

  if (existsSync(cacheFile)) {
    const cached = JSON.parse(await readFile(cacheFile, "utf-8"));
    return cached.status >= 200 && cached.status < 300 ? (cached.body as T) : null;
  }

  const host = new URL(url).host;
  const retries = opts.retries ?? 3;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    await throttle(host);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: opts.kind === "json" ? "application/json" : "text/html" },
        signal: AbortSignal.timeout(20000),
      });
      const status = res.status;
      const body = opts.kind === "json" ? await safeJson(res) : await res.text();
      const totalPages = res.headers.get("x-wp-totalpages");

      await writeFile(cacheFile, JSON.stringify({ url, status, totalPages, body }, null, 2));

      if (status >= 200 && status < 300) return body as T;
      if (status === 404) return null;
      if (status >= 500 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      return null;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
    }
  }
  console.warn(`[fetch failed] ${url}:`, lastError);
  return null;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Reads the totalPages header from cache for a paginated endpoint (fetch must have already happened). */
export async function cachedTotalPages(url: string, brand: string): Promise<number> {
  const cacheFile = path.join(RAW_DIR, brand, "_cache", `${cacheKeyFor(url)}.json`);
  if (!existsSync(cacheFile)) return 1;
  const cached = JSON.parse(await readFile(cacheFile, "utf-8"));
  return Number(cached.totalPages) || 1;
}

export async function fetchRobots(domain: string): Promise<string> {
  const url = `https://${domain}/robots.txt`;
  const dir = path.join(RAW_DIR, domain.replace(/\./g, "_"));
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, "robots.txt");
  if (existsSync(file)) return readFile(file, "utf-8");
  await throttle(domain);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  await writeFile(file, text);
  return text;
}
