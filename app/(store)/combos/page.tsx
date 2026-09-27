import Link from "next/link";
import { getBrands, getCatalog } from "@/lib/data";
import { paginate } from "@/lib/catalog-query";
import { ProductCard } from "@/components/brand/product-card";

export const metadata = { title: "Combos" };

export default async function CombosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const catalog = await getCatalog();
  const brands = await getBrands();
  const brandLogo = (id: string) => brands.find((b) => b.id === id)?.logo;
  const combos = catalog.filter((p) => p.type === "Combo");
  const { items, totalPages, page: currentPage } = paginate(combos, page ? Number(page) : 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Combos</h1>
      <p className="mt-1 text-sm text-muted-foreground">{combos.length.toLocaleString("en-IN")} bundled help-book combos, across all programmes.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} brandLogo={brandLogo(p.availableOn[0])} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          {currentPage > 1 && (
            <Link href={`/combos?page=${currentPage - 1}`} className="text-muted-foreground hover:text-foreground">
              Previous
            </Link>
          )}
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/combos?page=${currentPage + 1}`} className="text-muted-foreground hover:text-foreground">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
