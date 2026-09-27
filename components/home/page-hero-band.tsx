import { BrandLogo } from "@/components/brand/brand-logo";
import type { Brand } from "@/lib/types";

/** Branded hero band for cross-section pages (Combos, Offers) that aren't tied to one sub-brand — shows the master brand. */
export function PageHeroBand({ brand, title, subtitle }: { brand: Brand; title: string; subtitle: string }) {
  return (
    <section className="border-b bg-brand-primary/5 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
        <BrandLogo brand={brand} className="h-12 w-auto max-w-[160px]" />
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
