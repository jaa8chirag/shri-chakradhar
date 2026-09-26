import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { politeFetch, cachedTotalPages } from "./lib/http";
import type { SiteConfig } from "./sites.config";

export async function fetchWpRest(site: SiteConfig) {
  const outDir = path.join(process.cwd(), "data", "raw", site.id);
  await mkdir(outDir, { recursive: true });

  const siteInfo = await politeFetch<any>(`https://${site.domain}/wp-json`, { brand: site.id, kind: "json" });
  const pages = await fetchAllPages(site, "wp/v2/pages");
  const posts = await fetchAllPages(site, "wp/v2/posts", { per_page: 20, max: 1 });

  await writeFile(path.join(outDir, "wp-site.json"), JSON.stringify(siteInfo, null, 2));
  await writeFile(path.join(outDir, "wp-pages.json"), JSON.stringify(pages, null, 2));
  await writeFile(path.join(outDir, "wp-posts.json"), JSON.stringify(posts, null, 2));

  console.log(`[${site.id}] pages=${pages.length} posts=${posts.length}`);
  return { siteInfo, pages, posts };
}

async function fetchAllPages(
  site: SiteConfig,
  endpoint: string,
  opts: { per_page?: number; max?: number } = {}
): Promise<any[]> {
  const perPage = opts.per_page ?? 100;
  const results: any[] = [];
  let page = 1;
  while (true) {
    const url = `https://${site.domain}/wp-json/${endpoint}?per_page=${perPage}&page=${page}`;
    const body = await politeFetch<any[]>(url, { brand: site.id, kind: "json" });
    if (!body || !Array.isArray(body) || body.length === 0) break;
    results.push(...body);
    if (opts.max && page >= opts.max) break;
    const totalPages = await cachedTotalPages(url, site.id);
    if (page >= totalPages) break;
    page++;
  }
  return results;
}
