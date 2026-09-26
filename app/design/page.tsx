import { getBrands, getCatalog } from "@/lib/data";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ProductCard } from "@/components/brand/product-card";
import { ProductCover } from "@/components/brand/product-cover";
import { CourseCodeChip, TypeBadge, FormatBadge, LanguageBadge } from "@/components/brand/badges";
import { PriceTag } from "@/components/brand/price-tag";
import { TrustStrip } from "@/components/brand/trust-strip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Design System" };

export default async function DesignPage() {
  const brands = await getBrands();
  const catalog = await getCatalog();

  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 sm:px-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">Design System</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          One shared component library, themed per brand via a single <code className="rounded bg-muted px-1.5 py-0.5 text-sm">--brand-primary</code> CSS
          variable. Fonts: Plus Jakarta Sans (headings), Inter (body), Noto Sans Devanagari (Hindi).
        </p>
      </header>

      <section>
        <h2 className="font-heading text-xl font-semibold">Brand identities</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {brands.map((brand) => (
            <div key={brand.id} data-brand={brand.id} className="rounded-2xl border p-4">
              <BrandLogo brand={brand} className="h-10 w-10" />
              <p className="mt-3 font-heading font-semibold">{brand.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{brand.tagline}</p>
              <div className="mt-3 flex gap-2">
                <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: brand.colors.primary }} title="primary" />
                <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: brand.colors.secondary }} title="secondary" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Typography</h2>
        <div className="mt-4 space-y-2">
          <p className="font-heading text-4xl font-bold">Heading / Plus Jakarta Sans</p>
          <p className="text-base">Body text / Inter — IGNOU help books, solved assignments and guess papers for every programme.</p>
          <p className="font-devanagari text-lg">हिंदी पाठ / Noto Sans Devanagari — संस्कृत साहित्य का आलोचनात्मक विश्लेषण</p>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Badges & chips</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CourseCodeChip code="MMPC-001" />
          <TypeBadge type="HelpBook" />
          <TypeBadge type="SolvedAssignment" />
          <FormatBadge format="Both" />
          <LanguageBadge language="Both" />
          <PriceTag price={149} regularPrice={299} />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Product cover fallback (per brand)</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {brands.map((brand) => (
            <div key={brand.id} data-brand={brand.id}>
              <ProductCover product={{ courseCodes: ["MEG-01"], programme: "MA English", type: "HelpBook", title: `${brand.name} sample product` }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Product cards (real data, per brand)</h2>
        {brands.map((brand) => {
          const sample = catalog.filter((p) => p.availableOn.includes(brand.id)).slice(0, 4);
          if (sample.length === 0) return null;
          return (
            <div key={brand.id} data-brand={brand.id} className="mt-6">
              <p className="mb-3 text-sm font-medium text-muted-foreground">{brand.name}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {sample.map((p) => (
                  <ProductCard key={p.id} product={p} brandId={brand.id} brandLogo={brand.logo} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Trust strip</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <TrustStrip />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Buttons & skeletons</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
