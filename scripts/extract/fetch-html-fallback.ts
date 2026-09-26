import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { politeFetch, cachedTotalPages } from "./lib/http";
import type { SiteConfig } from "./sites.config";

/**
 * For sites where the WooCommerce Store API 500s (server-side bug, not a robots block):
 * 1. Pull the full lightweight product list from wp/v2/<product-cpt> (title, slug, content, taxonomies) — cheap, paginated.
 * 2. Pull product_cat / product_tag taxonomy terms for name lookups.
 * 3. Fetch each individual product page HTML and parse WooCommerce's standard
 *    `data-product_variations` attribute (or the classic `.price` block for simple products)
 *    for real price/sku/image data — this is how WooCommerce server-renders progressive-enhancement
 *    data for variable products, not a scraping trick.
 */
export async function fetchHtmlFallback(site: SiteConfig) {
  const outDir = path.join(process.cwd(), "data", "raw", site.id);
  await mkdir(outDir, { recursive: true });

  const productList = await fetchAllPages(site, "wp/v2/product");
  const categories = await fetchAllPages(site, "wp/v2/product_cat");
  const tags = await fetchAllPages(site, "wp/v2/product_tag");

  await writeFile(path.join(outDir, "wpv2-products.json"), JSON.stringify(productList, null, 2));
  await writeFile(path.join(outDir, "wpv2-product-cat.json"), JSON.stringify(categories, null, 2));
  await writeFile(path.join(outDir, "wpv2-product-tag.json"), JSON.stringify(tags, null, 2));
  console.log(`[${site.id}] wp/v2/product list=${productList.length} categories=${categories.length} tags=${tags.length}`);

  const detailed: any[] = [];
  for (let i = 0; i < productList.length; i++) {
    const p = productList[i];
    const detail = await fetchProductDetail(site, p);
    detailed.push(detail);
    if ((i + 1) % 50 === 0) {
      console.log(`[${site.id}] product detail progress: ${i + 1}/${productList.length}`);
      await writeFile(path.join(outDir, "html-fallback-products.json"), JSON.stringify(detailed, null, 2));
    }
  }
  await writeFile(path.join(outDir, "html-fallback-products.json"), JSON.stringify(detailed, null, 2));
  console.log(`[${site.id}] HTML fallback complete: ${detailed.length} products with detail`);
  return detailed;
}

async function fetchProductDetail(site: SiteConfig, listItem: any) {
  const html = await politeFetch<string>(listItem.link, { brand: site.id, kind: "text" });
  const base = {
    id: listItem.id,
    slug: listItem.slug,
    title: listItem.title?.rendered ?? "",
    link: listItem.link,
    content: listItem.content?.rendered ?? "",
    excerpt: listItem.excerpt?.rendered ?? "",
    categoryIds: listItem.product_cat ?? [],
    tagIds: listItem.product_tag ?? [],
    price: null as number | null,
    regularPrice: null as number | null,
    sku: null as string | null,
    image: null as string | null,
  };
  if (!html) return base;

  // This theme doesn't render a plain, cheerio-queryable <form class="variations_form"> —
  // WooCommerce's per-product pricing/variation data is embedded as an HTML-entity-escaped
  // JSON blob (used by a client-side quick-buy/cache-fragment widget), so we read it straight
  // out of the raw response text instead of via the DOM.
  const priceMatch = html.match(new RegExp(`&quot;sku&quot;:${base.id},&quot;price&quot;:([\\d.]+)`));
  if (priceMatch) base.price = parseFloat(priceMatch[1]);

  const pairMatch = html.match(/&quot;display_price&quot;:([\d.]+),&quot;display_regular_price&quot;:([\d.]+)/);
  if (pairMatch) {
    if (base.price === null) base.price = parseFloat(pairMatch[1]);
    base.regularPrice = parseFloat(pairMatch[2]);
  }

  const imageMatch = html.match(/&quot;full_src&quot;:&quot;((?:[^&]|&(?!quot;))+?)&quot;/);
  if (imageMatch) base.image = unescapeSlashes(imageMatch[1]);

  const skuMatch = html.match(/class="sku"[^>]*>([^<]+)</);
  if (skuMatch && skuMatch[1].trim() !== "N/A") base.sku = skuMatch[1].trim();

  if (base.price === null) {
    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!base.image && ogImage) base.image = ogImage[1];
  }

  return base;
}

function unescapeSlashes(text: string): string {
  return text.replace(/\\+\//g, "/");
}

async function fetchAllPages(site: SiteConfig, endpoint: string): Promise<any[]> {
  const results: any[] = [];
  let page = 1;
  while (true) {
    const url = `https://${site.domain}/wp-json/${endpoint}?per_page=100&page=${page}`;
    const body = await politeFetch<any[]>(url, { brand: site.id, kind: "json" });
    if (!body || !Array.isArray(body) || body.length === 0) break;
    results.push(...body);
    const totalPages = await cachedTotalPages(url, site.id);
    if (page >= totalPages) break;
    page++;
  }
  return results;
}
