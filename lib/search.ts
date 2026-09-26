import Fuse, { type IFuseOptions } from "fuse.js";
import type { Product } from "./types";

/** Strips spaces/hyphens and uppercases so "bevae 181", "BEVAE-181", "bevae181" all match the same course code. */
export function normalizeCodeQuery(query: string): string {
  return query.toUpperCase().replace(/[\s-]/g, "");
}

interface SearchableProduct extends Product {
  normalizedCodes: string[];
}

const FUSE_OPTIONS: IFuseOptions<SearchableProduct> = {
  keys: [
    { name: "normalizedCodes", weight: 3 },
    { name: "courseCodes", weight: 2 },
    { name: "title", weight: 1.5 },
    { name: "programme", weight: 1 },
    { name: "categories", weight: 0.5 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
};

export function buildSearchIndex(products: Product[]) {
  const searchable: SearchableProduct[] = products.map((p) => ({
    ...p,
    normalizedCodes: p.courseCodes.map(normalizeCodeQuery),
  }));
  return new Fuse(searchable, FUSE_OPTIONS);
}

export function searchProducts(fuse: Fuse<SearchableProduct>, query: string, limit = 30): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const normalized = normalizeCodeQuery(trimmed);
  // Exact/prefix course-code hits first (this is how most students actually search).
  const results = fuse.search(normalized.length >= 3 ? normalized : trimmed, { limit });
  return results.map((r) => r.item);
}
