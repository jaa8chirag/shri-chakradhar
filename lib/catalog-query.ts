import type { Product, ProductFormat, ProductLanguage, ProductLevel, ProductType } from "./types";

export interface CatalogFilters {
  level?: ProductLevel;
  programme?: string;
  type?: ProductType;
  format?: ProductFormat;
  language?: ProductLanguage;
  session?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "price-asc" | "price-desc" | "newest";
  page?: number;
}

export const PAGE_SIZE = 24;

export function filterCatalog(products: Product[], filters: CatalogFilters): Product[] {
  let result = products;
  if (filters.level) result = result.filter((p) => p.level === filters.level);
  if (filters.programme) result = result.filter((p) => p.programme === filters.programme);
  if (filters.type) result = result.filter((p) => p.type === filters.type);
  if (filters.format) result = result.filter((p) => p.format === filters.format || p.format === "Both");
  if (filters.language) result = result.filter((p) => p.language === filters.language || p.language === "Both");
  if (filters.session) result = result.filter((p) => p.session === filters.session);
  if (filters.minPrice !== undefined) result = result.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice !== undefined) result = result.filter((p) => p.price <= filters.maxPrice!);

  switch (filters.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "newest":
      result = [...result].sort((a, b) => (b.session ?? "").localeCompare(a.session ?? ""));
      break;
    default:
      break;
  }
  return result;
}

export function paginate<T>(items: T[], page = 1, pageSize = PAGE_SIZE): { items: T[]; totalPages: number; page: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), totalPages, page: safePage };
}

export interface MenuLevel {
  level: ProductLevel;
  programmes: { name: string; count: number }[];
}

/** Level -> Programme structure for a single brand's own catalog (not the global tree), used by the header's mega-menu. */
export function buildBrandMenu(products: Product[]): MenuLevel[] {
  const levelOrder: ProductLevel[] = ["Masters", "Bachelors", "Diploma", "Certificate"];
  const byLevel = new Map<ProductLevel, Map<string, number>>();

  for (const p of products) {
    if (!p.level || !p.programme) continue;
    if (!byLevel.has(p.level)) byLevel.set(p.level, new Map());
    const programmes = byLevel.get(p.level)!;
    programmes.set(p.programme, (programmes.get(p.programme) ?? 0) + 1);
  }

  return levelOrder
    .filter((level) => byLevel.has(level))
    .map((level) => ({
      level,
      programmes: Array.from(byLevel.get(level)!.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([name, count]) => ({ name, count })),
    }));
}

export interface Facets {
  levels: { value: ProductLevel; count: number }[];
  types: { value: ProductType; count: number }[];
  formats: { value: ProductFormat; count: number }[];
  languages: { value: ProductLanguage; count: number }[];
  sessions: { value: string; count: number }[];
}

export function computeFacets(products: Product[]): Facets {
  const count = <T extends string>(values: (T | null)[]): { value: T; count: number }[] => {
    const map = new Map<T, number>();
    for (const v of values) {
      if (!v) continue;
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    levels: count(products.map((p) => p.level)),
    types: count(products.map((p) => p.type)),
    formats: count(products.map((p) => p.format)),
    languages: count(products.map((p) => p.language)),
    sessions: count(products.map((p) => p.session)),
  };
}
