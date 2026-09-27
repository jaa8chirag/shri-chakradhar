import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrands, getStorefrontCatalog } from "@/lib/data";
import { SECTIONS, getProductsForSection, getSectionStartingPrice, type SectionId } from "@/lib/sections";
import { filterCatalog, computeFacets, paginate, type CatalogFilters } from "@/lib/catalog-query";
import { ProductCard } from "@/components/brand/product-card";
import { FilterPanel } from "@/components/brand/filter-panel";
import { MobileFilterDrawer } from "@/components/brand/mobile-filter-drawer";
import { SortSelect } from "@/components/brand/sort-select";
import { BrandLogo } from "@/components/brand/brand-logo";
import { GraduationCap } from "lucide-react";
import type { ProductFormat, ProductLanguage, ProductLevel, ProductType } from "@/lib/types";

export async function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionParam } = await params;
  const section = SECTIONS.find((s) => s.id === sectionParam);
  return { title: section?.label ?? "Not found" };
}

type SearchParams = Record<string, string | undefined>;

export default async function SectionPage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<SearchParams> }) {
  const { section: sectionParam } = await params;
  const section = SECTIONS.find((s) => s.id === sectionParam);
  if (!section) notFound();

  const sp = await searchParams;
  const brands = await getBrands();
  const catalog = await getStorefrontCatalog();
  const subBrand = brands.find((b) => b.id === section.subBrandId)!;
  const sectionProducts = getProductsForSection(catalog, section.id as SectionId);
  const facets = computeFacets(sectionProducts);
  const startingPrice = getSectionStartingPrice(catalog, section.id as SectionId);

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

  const filtered = filterCatalog(sectionProducts, filters);
  const { items, totalPages, page } = paginate(filtered, filters.page);
  const activeCount = [filters.level, filters.programme, filters.type, filters.format, filters.language, filters.session].filter(Boolean).length;

  return (
    <div>
      <section className="border-b bg-brand-primary/5 px-4 py-8 sm:px-6" data-brand={subBrand.id} style={{ "--brand-primary": subBrand.colors.primary } as React.CSSProperties}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <BrandLogo brand={subBrand} className="h-12 w-auto max-w-[160px]" />
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">{section.label}</h1>
            <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted-foreground">
              {section.keyFacts.map((f) => (
                <span key={f} className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-brand-primary" /> {f}
                </span>
              ))}
            </p>
          </div>
          {startingPrice !== null && (
            <span className="ml-auto rounded-full bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white">From ₹{startingPrice}</span>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{filtered.length.toLocaleString("en-IN")} products</p>
          <div className="flex items-center gap-2">
            <MobileFilterDrawer activeCount={activeCount}>
              <FilterPanel basePath={section.path} facets={facets} current={filters} />
            </MobileFilterDrawer>
            <SortSelect basePath={section.path} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[220px_1fr]">
          <aside className="hidden sm:block">
            <FilterPanel basePath={section.path} facets={facets} current={filters} />
          </aside>

          <div>
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
                <p>No products match these filters.</p>
                <Link href={section.path} className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} brandLogo={subBrand.logo} />
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
                        href={pageHref(section.path, sp, n)}
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
    </div>
  );
}

function pageHref(sectionPath: string, sp: SearchParams, page: number): string {
  const params = new URLSearchParams(Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][]);
  params.set("page", String(page));
  return `${sectionPath}?${params.toString()}`;
}
