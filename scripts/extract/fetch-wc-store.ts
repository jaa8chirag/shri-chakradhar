import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { politeFetch, cachedTotalPages } from "./lib/http";
import type { SiteConfig } from "./sites.config";

/**
 * Some sites (e.g. shrichakradhar.com) have an SEO plugin auto-generating a near-unique
 * product tag per keyword phrase, producing 900+ pages (~92k tags) on the sitewide tags
 * collection. We never read that standalone list for normalization — each product already
 * carries its own `tags: [{id,name,slug}]` array inline, which is what dedup/categorization
 * actually uses — so the sitewide list is capped rather than paginated to exhaustion.
 */
const MAX_TAG_PAGES = 10;

export async function fetchStoreApi(site: SiteConfig) {
  const outDir = path.join(process.cwd(), "data", "raw", site.id);
  await mkdir(outDir, { recursive: true });

  const products = await fetchAllPages(site, "products", { onProgress: (items) => writeFile(path.join(outDir, "wc-products.json"), JSON.stringify(items, null, 2)) });
  const categories = await fetchAllPages(site, "products/categories");
  const tags = await fetchAllPages(site, "products/tags", { maxPages: MAX_TAG_PAGES });

  await writeFile(path.join(outDir, "wc-products.json"), JSON.stringify(products, null, 2));
  await writeFile(path.join(outDir, "wc-categories.json"), JSON.stringify(categories, null, 2));
  await writeFile(path.join(outDir, "wc-tags.json"), JSON.stringify(tags, null, 2));

  console.log(`[${site.id}] products=${products.length} categories=${categories.length} tags=${tags.length} (tags capped at ${MAX_TAG_PAGES} pages)`);
  return { products, categories, tags };
}

async function fetchAllPages(
  site: SiteConfig,
  endpoint: string,
  opts: { maxPages?: number; onProgress?: (items: any[]) => Promise<void> } = {}
): Promise<any[]> {
  const results: any[] = [];
  let page = 1;
  while (true) {
    const url = `https://${site.domain}/wp-json/wc/store/v1/${endpoint}?per_page=100&page=${page}`;
    const body = await politeFetch<any[]>(url, { brand: site.id, kind: "json" });
    if (!body || !Array.isArray(body) || body.length === 0) break;
    results.push(...body);
    if (opts.onProgress && page % 20 === 0) await opts.onProgress(results);
    const totalPages = await cachedTotalPages(url, site.id);
    if (page >= totalPages) break;
    if (opts.maxPages && page >= opts.maxPages) break;
    page++;
  }
  return results;
}
