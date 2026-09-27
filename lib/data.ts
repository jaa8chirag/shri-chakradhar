import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Brand, BrandId, BrandPages, CategoryNode, Product, Stats } from "./types";

/**
 * Repository over /data/clean/*.json. Deliberately the only place the app touches the
 * filesystem — swapping this for a .NET API + Postgres later means rewriting these
 * functions only, not their call sites.
 */
const DATA_DIR = path.join(process.cwd(), "data", "clean");

type ProductDetails = Pick<Product, "description" | "shortDescription" | "categories" | "tags">;

let cache: {
  brands?: Brand[];
  catalog?: Product[];
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

export async function getCatalog(): Promise<Product[]> {
  if (!cache.catalog) cache.catalog = await readJson<Product[]>("catalog.json");
  return cache.catalog;
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

/** Brand-agnostic lookup — the unified store's product page isn't scoped to any one brand. */
export async function getProductBySlugGlobal(slug: string): Promise<Product | undefined> {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.slug === slug);
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
 * Admin demo "wow moment": toggling a brand's visibility for a product writes straight through
 * to catalog.json and updates the in-memory cache so every request in this server process sees
 * it immediately — the same seam a real .NET API + Postgres UPDATE would sit behind later.
 */
export async function setProductVisibility(productId: string, brandId: BrandId, visible: boolean): Promise<Product | undefined> {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === productId);
  if (!product) return undefined;

  const has = product.availableOn.includes(brandId);
  if (visible && !has) product.availableOn.push(brandId);
  if (!visible && has) product.availableOn = product.availableOn.filter((b) => b !== brandId);

  await writeFile(path.join(DATA_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));
  return product;
}

export async function updateProductPrice(productId: string, price: number): Promise<Product | undefined> {
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.id === productId);
  if (!product) return undefined;
  product.price = price;
  await writeFile(path.join(DATA_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));
  return product;
}
