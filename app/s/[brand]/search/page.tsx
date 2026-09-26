import { notFound } from "next/navigation";
import { getBrand, getProductsForBrand } from "@/lib/data";
import { buildSearchIndex, searchProducts } from "@/lib/search";
import { SearchBar } from "@/components/brand/search-bar";
import { ProductCard } from "@/components/brand/product-card";
import type { BrandId } from "@/lib/types";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { brand: brandId } = await params;
  const { q = "" } = await searchParams;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const products = await getProductsForBrand(brand.id);
  const index = buildSearchIndex(products);
  const results = q ? searchProducts(index, q, 60) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <SearchBar brandId={brand.id} size="large" />
      </div>

      {q && (
        <p className="mt-6 text-sm text-muted-foreground">
          {results.length} result{results.length === 1 ? "" : "s"} for &quot;{q}&quot;
        </p>
      )}

      {q && results.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          <p>No products found for &quot;{q}&quot;.</p>
          <p className="mt-1 text-sm">Try just the course code, e.g. MMPC 001 or BEGC134.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} brandId={brand.id} brandLogo={brand.logo} />
          ))}
        </div>
      )}
    </div>
  );
}
