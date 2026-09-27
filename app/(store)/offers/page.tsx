import Link from "next/link";
import { getBrands, getCatalog } from "@/lib/data";
import { paginate } from "@/lib/catalog-query";
import { ProductCard } from "@/components/brand/product-card";
import { PageHeroBand } from "@/components/home/page-hero-band";
import type { Product } from "@/lib/types";

export const metadata = { title: "Offers" };

export default async function OffersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const catalog = await getCatalog();
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const brandLogo = (id: string) => brands.find((b) => b.id === id)?.logo;

  const discounted = catalog
    // price > 0 excludes a handful of products with a data-scraping price gap from being
    // shown as a misleading "100% off" — a real offer always has a real non-zero price.
    .filter((p) => p.price > 0 && p.regularPrice > p.price && p.images.length > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a));

  const { items, totalPages, page: currentPage } = paginate(discounted, page ? Number(page) : 1);

  return (
    <div>
      <PageHeroBand brand={masterBrand} title="Offers" subtitle={`${discounted.length.toLocaleString("en-IN")} products on discount, biggest savings first.`} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} brandLogo={brandLogo(p.availableOn[0])} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4 text-sm">
            {currentPage > 1 && (
              <Link href={`/offers?page=${currentPage - 1}`} className="text-muted-foreground hover:text-foreground">
                Previous
              </Link>
            )}
            <span className="text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link href={`/offers?page=${currentPage + 1}`} className="text-muted-foreground hover:text-foreground">
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function discountPercent(p: Product): number {
  return p.regularPrice > 0 ? (p.regularPrice - p.price) / p.regularPrice : 0;
}
