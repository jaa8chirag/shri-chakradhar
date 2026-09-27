import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { getRedis } from "./kv";
import type { Brand, BrandId, BrandPages, CategoryNode, Product, Stats } from "./types";

/**
 * Repository over /data/clean/*.json. Deliberately the only place the app touches the
 * filesystem — swapping this for a .NET API + Postgres later means rewriting these
 * functions only, not their call sites.
 */
const DATA_DIR = path.join(process.cwd(), "data", "clean");
const RUNTIME_DIR = path.join(process.cwd(), "data", "runtime");
const OVERRIDES_FILE = path.join(RUNTIME_DIR, "catalog-overrides.json");
const OVERRIDES_KEY = "catalog-overrides";

type ProductDetails = Pick<Product, "description" | "shortDescription" | "categories" | "tags">;
type CatalogOverride = { availableOn?: BrandId[]; price?: number };
type CatalogOverrides = Record<string, CatalogOverride>;

const cache: {
  brands?: Brand[];
  catalogBase?: Product[];
  categories?: CategoryNode[];
  pages?: Record<BrandId, BrandPages>;
  stats?: Stats;
  productDetails?: Record<string, ProductDetails>;
} = {};

async function readJson<T>(file: string): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

export async function getBrands(): Promise<Brand[]> {
  if (!cache.brands) cache.brands = await readJson<Brand[]>("brands.json");
  return cache.brands;
}

export async function getBrand(id: BrandId): Promise<Brand | undefined> {
  const brands = await getBrands();
  return brands.find((b) => b.id === id);
}

/**
 * Admin edits (catalog visibility toggles, price changes) never touch the ~17k-product
 * catalog.json file itself — on Vercel that file is a read-only bundled asset, and even
 * locally, re-writing an 18MB file on every click doesn't scale. Instead they're stored as a
 * small overrides map (Redis in production, a local JSON file for zero-setup dev) and merged
 * onto the static catalog on every read, so admin/storefront/search all see the same live
 * state without any extra cache invalidation.
 */
async function getCatalogOverrides(): Promise<CatalogOverrides> {
  const redis = getRedis();
  if (redis) return (await redis.get<CatalogOverrides>(OVERRIDES_KEY)) ?? {};
  if (!existsSync(OVERRIDES_FILE)) return {};
  try {
    return JSON.parse(await readFile(OVERRIDES_FILE, "utf-8")) as CatalogOverrides;
  } catch {
    return {};
  }
}

async function writeCatalogOverrides(overrides: CatalogOverrides): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(OVERRIDES_KEY, overrides);
    return;
  }
  await mkdir(RUNTIME_DIR, { recursive: true });
  await writeFile(OVERRIDES_FILE, JSON.stringify(overrides, null, 2));
}

function applyOverrides(catalog: Product[], overrides: CatalogOverrides): Product[] {
  if (Object.keys(overrides).length === 0) return catalog;
  return catalog.map((p) => {
    const o = overrides[p.id];
    if (!o) return p;
    return { ...p, availableOn: o.availableOn ?? p.availableOn, price: o.price ?? p.price };
  });
}

/** Full catalog including products an admin has hidden from every brand — only /admin/catalog should use this directly, so it can still find and re-enable them. */
export async function getCatalog(): Promise<Product[]> {
  if (!cache.catalogBase) cache.catalogBase = await readJson<Product[]>("catalog.json");
  const overrides = await getCatalogOverrides();
  return applyOverrides(cache.catalogBase, overrides);
}

/** What the storefront (sections, search, combos, offers, product pages) should ever show — excludes anything toggled off every brand. */
export async function getStorefrontCatalog(): Promise<Product[]> {
  const catalog = await getCatalog();
  return catalog.filter((p) => p.availableOn.length > 0);
}

export async function getProductsForBrand(brandId: BrandId): Promise<Product[]> {
  const catalog = await getCatalog();
  return catalog.filter((p) => p.availableOn.includes(brandId));
}

/**
 * catalog.json ships with description/shortDescription/categories/tags stripped to keep the
 * hot path (browse/search/home) light — the full values live in product-details.json, loaded
 * lazily only here, the one place that actually renders them.
 */
async function getProductDetails(productId: string): Promise<ProductDetails> {
  if (!cache.productDetails) cache.productDetails = await readJson<Record<string, ProductDetails>>("product-details.json");
  return cache.productDetails[productId] ?? { description: "", shortDescription: "", categories: [], tags: [] };
}

export async function getProductBySlug(brandId: BrandId, slug: string): Promise<Product | undefined> {
  const products = await getProductsForBrand(brandId);
  const product = products.find((p) => p.slug === slug);
  if (!product) return undefined;
  return { ...product, ...(await getProductDetails(product.id)) };
}

/**
 * Brand-agnostic lookup — the unified store's product page isn't scoped to any one brand.
 * availableOn.length === 0 means admin has toggled it off every brand, so it's treated as
 * not found here (though /admin/catalog can still see and re-enable it via getCatalog()).
 */
export async function getProductBySlugGlobal(slug: string): Promise<Product | undefined> {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.slug === slug && p.availableOn.length > 0);
  if (!product) return undefined;
  return { ...product, ...(await getProductDetails(product.id)) };
}

export async function getCategories(): Promise<CategoryNode[]> {
  if (!cache.categories) cache.categories = await readJson<CategoryNode[]>("categories.json");
  return cache.categories;
}

export async function getPages(): Promise<Record<BrandId, BrandPages>> {
  if (!cache.pages) cache.pages = await readJson<Record<BrandId, BrandPages>>("pages.json");
  return cache.pages;
}

export async function getStats(): Promise<Stats> {
  if (!cache.stats) cache.stats = await readJson<Stats>("stats.json");
  return cache.stats;
}

/**
 * Admin demo "wow moment": toggling a brand's visibility for a product persists to the
 * overrides store (Redis on Vercel, a local file otherwise) and is picked up by every
 * getCatalog() call immediately — the same seam a real .NET API + Postgres UPDATE would sit
 * behind later.
 */
export async function setProductVisibility(productId: string, brandId: BrandId, visible: boolean): Promise<Product | undefined> {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === productId);
  if (!product) return undefined;

  const has = product.availableOn.includes(brandId);
  const nextAvailableOn = visible && !has ? [...product.availableOn, brandId] : !visible && has ? product.availableOn.filter((b) => b !== brandId) : product.availableOn;

  const overrides = await getCatalogOverrides();
  overrides[productId] = { ...overrides[productId], availableOn: nextAvailableOn };
  await writeCatalogOverrides(overrides);

  return { ...product, availableOn: nextAvailableOn };
}

export async function updateProductPrice(productId: string, price: number): Promise<Product | undefined> {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === productId);
  if (!product) return undefined;

  const overrides = await getCatalogOverrides();
  overrides[productId] = { ...overrides[productId], price };
  await writeCatalogOverrides(overrides);

  return { ...product, price };
}
