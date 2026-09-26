import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrand, getProductsForBrand } from "@/lib/data";
import { filterCatalog, computeFacets, paginate, type CatalogFilters } from "@/lib/catalog-query";
import { ProductCard } from "@/components/brand/product-card";
import { FilterPanel } from "@/components/brand/filter-panel";
import { MobileFilterDrawer } from "@/components/brand/mobile-filter-drawer";
import { SortSelect } from "@/components/brand/sort-select";
import type { BrandId, ProductFormat, ProductLanguage, ProductLevel, ProductType } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandId } = await params;
  const brand = await getBrand(brandId as BrandId);
  return { title: `Browse — ${brand?.name}` };
}

type SearchParams = Record<string, string | undefined>;

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { brand: brandId } = await params;
  const sp = await searchParams;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const allProducts = await getProductsForBrand(brand.id);
  const facets = computeFacets(allProducts);

  const filters: CatalogFilters = {
    level: sp.level as ProductLevel | undefined,
    programme: sp.programme,
    type: sp.type as ProductType | undefined,
    format: sp.format as ProductFormat | undefined,
    language: sp.language as ProductLanguage | undefined,
    session: sp.session,
    sort: (sp.sort as CatalogFilters["sort"]) ?? "relevance",
    page: sp.page ? Number(sp.page) : 1,
  };

  const filtered = filterCatalog(allProducts, filters);
  const { items, totalPages, page } = paginate(filtered, filters.page);
  const activeCount = [filters.level, filters.programme, filters.type, filters.format, filters.language, filters.session].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{filters.programme ? filters.programme : "Browse all"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length.toLocaleString("en-IN")} products</p>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilterDrawer activeCount={activeCount}>
            <FilterPanel brandId={brand.id} facets={facets} current={filters} />
          </MobileFilterDrawer>
          <SortSelect brandId={brand.id} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[220px_1fr]">
        <aside className="hidden sm:block">
          <FilterPanel brandId={brand.id} facets={facets} current={filters} />
        </aside>

        <div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              <p>No products match these filters.</p>
              <Link href={`/s/${brand.id}/browse`} className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} brandId={brand.id} brandLogo={brand.logo} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .map((n, idx, arr) => (
                  <span key={n} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== n - 1 && <span className="text-muted-foreground">…</span>}
                    <Link
                      href={pageHref(brand.id, sp, n)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md text-sm ${
                        n === page ? "bg-brand-primary text-white" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {n}
                    </Link>
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function pageHref(brandId: BrandId, sp: SearchParams, page: number): string {
  const params = new URLSearchParams(Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][]);
  params.set("page", String(page));
  return `/s/${brandId}/browse?${params.toString()}`;
}
