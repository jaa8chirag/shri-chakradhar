import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { SiteConfig } from "../sites.config";
import type { BrandId, Product } from "../../../lib/types";
import { extractCourseCodes, extractProgramme, extractLevel, extractLanguage, extractFormat, extractType, extractSession } from "./course-code";
import { sanitizeHtml, stripToText } from "./sanitize-html";
import { scrubOverclaims } from "./content-policy";

/**
 * WordPress stores some Hindi-titled products' slugs as literally percent-encoded ASCII
 * (e.g. "...%e0%a4%b8%e0%a4%ae...") rather than decoded Unicode — ~5% of the catalog. Left as-is,
 * Next.js's dynamic route param matching doesn't reliably resolve them. Decoding once here gives
 * a normal Devanagari slug that routes exactly like any other UTF-8 URL segment.
 */
function normalizeSlug(slug: string): string {
  if (!slug.includes("%")) return slug;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** Pre-merge product record: one per (site, product) pair, availableOn always [site] at this stage. */
export async function loadSiteProducts(site: SiteConfig): Promise<Product[]> {
  const rawDir = path.join(process.cwd(), "data", "raw", site.id);

  if (site.storeApiBroken) {
    return loadFromHtmlFallback(site, rawDir);
  }
  if (!site.hasWooCommerce) {
    return [];
  }
  return loadFromStoreApi(site, rawDir);
}

async function loadFromStoreApi(site: SiteConfig, rawDir: string): Promise<Product[]> {
  const products = await readJsonSafe<any[]>(path.join(rawDir, "wc-products.json"));
  if (!products) return [];

  return products.map((p) => {
    const minorUnit = Number(p.prices?.currency_minor_unit ?? 2);
    const price = centsToAmount(p.prices?.price, minorUnit);
    const regularPrice = centsToAmount(p.prices?.regular_price, minorUnit) || price;
    const salePrice = p.on_sale ? centsToAmount(p.prices?.sale_price, minorUnit) : null;
    const categories: string[] = (p.categories ?? []).map((c: any) => c.name);
    const tags: string[] = (p.tags ?? []).map((t: any) => t.name);
    const haystack = [p.name, categories.join(" "), tags.join(" "), stripToText(p.short_description ?? "")].join(" ");

    return buildProduct({
      brandId: site.id as BrandId,
      idSeed: `${site.id}-${p.id}`,
      slug: normalizeSlug(p.slug),
      title: decodeEntities(p.name ?? ""),
      sourceUrl: p.permalink,
      sku: p.sku || null,
      price,
      regularPrice,
      salePrice,
      images: (p.images ?? []).map((img: any) => img.src).filter(Boolean).slice(0, 5),
      shortDescription: stripToText(p.short_description ?? ""),
      description: sanitizeHtml(p.description ?? ""),
      categories,
      tags,
      haystack,
    });
  });
}

async function loadFromHtmlFallback(site: SiteConfig, rawDir: string): Promise<Product[]> {
  const products = await readJsonSafe<any[]>(path.join(rawDir, "html-fallback-products.json"));
  const cats = await readJsonSafe<any[]>(path.join(rawDir, "wpv2-product-cat.json"));
  const tags = await readJsonSafe<any[]>(path.join(rawDir, "wpv2-product-tag.json"));
  if (!products) return [];

  const catNameById = new Map<number, string>((cats ?? []).map((c: any) => [c.id, decodeEntities(c.name)]));
  const tagNameById = new Map<number, string>((tags ?? []).map((t: any) => [t.id, decodeEntities(t.name)]));

  return products.map((p) => {
    const categories = (p.categoryIds ?? []).map((id: number) => catNameById.get(id)).filter(Boolean) as string[];
    const productTags = (p.tagIds ?? []).map((id: number) => tagNameById.get(id)).filter(Boolean) as string[];
    const title = decodeEntities(stripToText(p.title ?? ""));
    const shortDescription = stripToText(p.excerpt ?? "").slice(0, 300);
    const haystack = [title, categories.join(" "), productTags.join(" "), shortDescription].join(" ");

    return buildProduct({
      brandId: site.id as BrandId,
      idSeed: `${site.id}-${p.id}`,
      slug: normalizeSlug(p.slug),
      title,
      sourceUrl: p.link,
      sku: p.sku,
      price: p.price,
      regularPrice: p.regularPrice ?? p.price,
      salePrice: p.regularPrice && p.price && p.regularPrice > p.price ? p.price : null,
      images: p.image ? [p.image] : [],
      shortDescription,
      description: sanitizeHtml(p.content ?? ""),
      categories,
      tags: productTags,
      haystack,
    });
  });
}

interface BuildArgs {
  brandId: BrandId;
  idSeed: string;
  slug: string;
  title: string;
  sourceUrl: string;
  sku: string | null;
  price: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  images: string[];
  shortDescription: string;
  description: string;
  categories: string[];
  tags: string[];
  haystack: string;
}

function buildProduct(args: BuildArgs): Product {
  const courseCodes = extractCourseCodes(args.haystack);
  return {
    id: args.idSeed,
    slug: args.slug,
    title: args.title,
    courseCodes,
    programme: extractProgramme(args.haystack),
    level: extractLevel(args.haystack),
    type: extractType(args.haystack, args.categories.join(" ")),
    format: extractFormat(args.haystack),
    language: extractLanguage(args.haystack),
    session: extractSession(args.haystack),
    price: args.price ?? 0,
    regularPrice: args.regularPrice ?? args.price ?? 0,
    salePrice: args.salePrice,
    currency: "INR",
    images: args.images,
    shortDescription: scrubOverclaims(args.shortDescription),
    description: scrubOverclaims(args.description),
    categories: args.categories,
    tags: args.tags,
    availableOn: [args.brandId],
    sourceUrls: { [args.brandId]: args.sourceUrl } as Partial<Record<BrandId, string>>,
  };
}

function centsToAmount(value: string | number | undefined, minorUnit: number): number {
  if (value === undefined || value === null) return 0;
  const n = Number(value);
  if (isNaN(n)) return 0;
  return n / 10 ** minorUnit;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

async function readJsonSafe<T>(file: string): Promise<T | null> {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(await readFile(file, "utf-8")) as T;
  } catch {
    return null;
  }
}
