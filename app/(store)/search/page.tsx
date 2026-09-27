import { getBrands, getStorefrontCatalog } from "@/lib/data";
import { buildSearchIndex, searchProducts } from "@/lib/search";
import { GlobalSearchBar } from "@/components/layout/global-search-bar";
import { ProductCard } from "@/components/brand/product-card";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; programme?: string }> }) {
  const { q, programme } = await searchParams;
  return { title: q ? `Search: ${q}` : programme ? programme : "Search" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; programme?: string }> }) {
  const { q = "", programme } = await searchParams;
  const catalog = await getStorefrontCatalog();
  const brands = await getBrands();
  const brandLogo = (id: string) => brands.find((b) => b.id === id)?.logo;

  let results = catalog;
  if (programme) {
    results = catalog.filter((p) => p.programme === programme);
  } else if (q) {
    const index = buildSearchIndex(catalog);
    results = searchProducts(index, q, 60);
  } else {
    results = [];
  }

  const heading = programme ?? q;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <GlobalSearchBar size="large" />
      </div>

      {heading && (
        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} result{results.length === 1 ? "" : "s"} for &quot;{heading}&quot;
        </p>
      )}

      {heading && results.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          <p>No products found for &quot;{heading}&quot;.</p>
          <p className="mt-1 text-sm">Try just the course code, e.g. MMPC 001 or BEGC134.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} brandLogo={brandLogo(p.availableOn[0])} />
          ))}
        </div>
      )}
    </div>
  );
}
