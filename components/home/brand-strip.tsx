import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { getSectionForBrand } from "@/lib/sections";
import type { Brand } from "@/lib/types";

export function BrandStrip({ brands }: { brands: Brand[] }) {
  return (
    <section className="border-y bg-muted/20 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Our Brands</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {brands.map((brand) => {
            const section = getSectionForBrand(brand.id);
            return (
              <Link
                key={brand.id}
                href={section?.path ?? "/"}
                className="grayscale opacity-70 transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              >
                <BrandLogo brand={brand} className="h-8 w-auto max-w-[130px]" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
