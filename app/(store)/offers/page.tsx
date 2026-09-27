import Link from "next/link";
import { getBrands, getCatalog } from "@/lib/data";
import { paginate } from "@/lib/catalog-query";
import { ProductCard } from "@/components/brand/product-card";
import type { Product } from "@/lib/types";

export const metadata = { title: "Offers" };

export default async function OffersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const catalog = await getCatalog();
  const brands = await getBrands();
  const brandLogo = (id: string) => brands.find((b) => b.id === id)?.logo;

  const discounted = catalog
    .filter((p) => p.regularPrice > p.price && p.images.length > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a));

  const { items, totalPages, page: currentPage } = paginate(discounted, page ? Number(page) : 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Offers</h1>
      <p className="mt-1 text-sm text-muted-foreground">{discounted.length.toLocaleString("en-IN")} products on discount, biggest savings first.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
  );
}

function discountPercent(p: Product): number {
  return p.regularPrice > 0 ? (p.regularPrice - p.price) / p.regularPrice : 0;
}
