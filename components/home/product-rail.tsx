import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/brand/product-card";
import { BrandLogo } from "@/components/brand/brand-logo";
import type { Product, Brand } from "@/lib/types";

export function ProductRail({ title, subBrand, products, viewAllHref }: { title: string; subBrand: Brand; products: Product[]; viewAllHref: string }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandLogo brand={subBrand} className="h-6 w-6 rounded" />
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
        </div>
        <Link href={viewAllHref} className="flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <div key={p.id} className="w-[42vw] shrink-0 snap-start sm:w-[220px]">
            <ProductCard product={p} brandLogo={subBrand.logo} />
          </div>
        ))}
      </div>
    </section>
  );
}
