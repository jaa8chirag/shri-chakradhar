import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SITES } from "./sites.config";
import type { Brand, Product } from "../../lib/types";

const USER_AGENT = "GGM-Technologies-Demo-Builder/1.0";
const CLEAN_DIR = path.join(process.cwd(), "data", "clean");
const RAW_DIR = path.join(process.cwd(), "data", "raw");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Downloads brand logos/favicons and product images to /public, converting to webp (sharp).
 * Rewrites catalog.json / brands.json in place afterwards to point at the local files that
 * actually landed on disk — any image that 404s or fails is dropped so the UI falls back to
 * the generated ProductCover / a placeholder logo instead of a broken <img>.
 */
async function main() {
  const brands: Brand[] = JSON.parse(await readFile(path.join(CLEAN_DIR, "brands.json"), "utf-8"));
  const catalog: Product[] = JSON.parse(await readFile(path.join(CLEAN_DIR, "catalog.json"), "utf-8"));

  let logosOk = 0;
  let logosFailed = 0;
  for (const site of SITES) {
    const brand = brands.find((b) => b.id === site.id);
    if (!brand) continue;
    const homepage = await readJsonSafe<any>(path.join(RAW_DIR, site.id, "homepage-extract.json"));
    const ok = await downloadBrandAssets(brand, homepage?.logoUrl ?? null, homepage?.faviconUrl ?? null);
    if (ok) logosOk++;
    else logosFailed++;
  }
  console.log(`Brand logos: ${logosOk} ok, ${logosFailed} kept placeholder`);

  let imagesOk = 0;
  let imagesFailed = 0;
  for (const product of catalog) {
    const srcUrl = product.images[0];
    if (!srcUrl || !srcUrl.startsWith("http")) continue;
    const localPaths: string[] = [];
    for (const brandId of product.availableOn) {
      const localPath = await downloadProductImage(brandId, product.slug, srcUrl);
      if (localPath) localPaths.push(localPath);
    }
    if (localPaths.length > 0) {
      product.images = [localPaths[0]];
      imagesOk++;
    } else {
      product.images = [];
      imagesFailed++;
    }
  }
  console.log(`Product images: ${imagesOk} ok, ${imagesFailed} failed (falls back to generated cover in the UI)`);

  await writeFile(path.join(CLEAN_DIR, "brands.json"), JSON.stringify(brands, null, 2));
  await writeFile(path.join(CLEAN_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));
}

async function downloadBrandAssets(brand: Brand, logoUrl: string | null, faviconUrl: string | null): Promise<boolean> {
  const dir = path.join(PUBLIC_DIR, "brands", brand.id);
  await mkdir(dir, { recursive: true });
  let ok = true;

  if (logoUrl) {
    const localLogo = await fetchAndSave(logoUrl, path.join(dir, "logo"), 400);
    if (localLogo) brand.logo = `/brands/${brand.id}/${localLogo}`;
    else ok = false;
  } else {
    ok = false;
  }

  if (faviconUrl) {
    const localFavicon = await fetchAndSave(faviconUrl, path.join(dir, "favicon"), 64);
    if (localFavicon) brand.favicon = `/brands/${brand.id}/${localFavicon}`;
  }

  return ok;
}

async function downloadProductImage(brandId: string, slug: string, url: string): Promise<string | null> {
  const dir = path.join(PUBLIC_DIR, "products", brandId);
  await mkdir(dir, { recursive: true });
  const outFile = path.join(dir, `${slug}.webp`);
  const publicPath = `/products/${brandId}/${slug}.webp`;
  if (existsSync(outFile)) return publicPath;
  const ok = await fetchAndSaveWebp(url, outFile);
  return ok ? publicPath : null;
}

/** Returns the filename (e.g. "logo.svg" / "logo.webp") that was actually written, or null on failure. */
async function fetchAndSave(url: string, outBase: string, maxDim: number): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    const base = path.basename(outBase);
    if (ext === ".svg") {
      await writeFile(`${outBase}.svg`, buf);
      return `${base}.svg`;
    }
    await sharp(buf)
      .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(`${outBase}.webp`);
    return `${base}.webp`;
  } catch {
    return null;
  }
}

async function fetchAndSaveWebp(url: string, outFile: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toFile(outFile);
    return true;
  } catch {
    return false;
  }
}

async function readJsonSafe<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return null;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
