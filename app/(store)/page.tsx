import Link from "next/link";
import { PenLine, Send, FileText, CheckCircle2 } from "lucide-react";
import { getBrands, getStorefrontCatalog } from "@/lib/data";
import { buildSectionMenuData } from "@/lib/section-menu-data";
import { getProductsForSection } from "@/lib/sections";
import { HeroSection } from "@/components/brand/hero-section";
import { FadeInSection } from "@/components/brand/fade-in-section";
import { TrustStrip } from "@/components/brand/trust-strip";
import { SectionTiles } from "@/components/home/section-tiles";
import { ProductRail } from "@/components/home/product-rail";
import { BrandStrip } from "@/components/home/brand-strip";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

const TIMELINE = [
  { icon: PenLine, label: "Topic", detail: "You choose or we help" },
  { icon: Send, label: "Synopsis", detail: "Delivered next day" },
  { icon: CheckCircle2, label: "Guide approval", detail: "You share with your guide" },
  { icon: FileText, label: "Report", detail: "Written in ~8 days" },
];

export default async function HomePage() {
  const brands = await getBrands();
  const catalog = await getStorefrontCatalog();
  const sectionData = buildSectionMenuData(catalog, brands);

  const programmeCounts = new Map<string, number>();
  for (const p of catalog) {
    if (p.programme) programmeCounts.set(p.programme, (programmeCounts.get(p.programme) ?? 0) + 1);
  }
  const topProgrammes = Array.from(programmeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  return (
    <div>
      <HeroSection name="Everything for your IGNOU course" tagline="Books, solved assignments, question papers, guess papers and project guidance — all in one place." />

      <FadeInSection className="-mt-6 pb-4">
        <SectionTiles data={sectionData} />
      </FadeInSection>

      <FadeInSection className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="font-heading text-lg font-semibold">Shop by programme</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {topProgrammes.map((programme) => (
            <Link
              key={programme}
              href={`/search?programme=${encodeURIComponent(programme)}`}
              className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              {programme}
            </Link>
          ))}
        </div>
      </FadeInSection>

      {sectionData.map(({ section, subBrand }) => (
        <ProductRail
          key={section.id}
          title={section.label}
          subBrand={subBrand}
          products={pickFeatured(getProductsForSection(catalog, section.id), 10)}
          viewAllHref={section.path}
        />
      ))}

      <FadeInSection className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Card data-brand="ignouproject" className="overflow-hidden bg-brand-primary/5 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">Projects &amp; Synopsis</p>
              <h2 className="mt-1 font-heading text-2xl font-bold">Custom IGNOU project writing</h2>
              <p className="mt-1 text-sm text-muted-foreground">Synopsis next day · Report in ~8 days · Guide support for MBA/MCOM</p>
            </div>
            <Button size="lg" nativeButton={false} render={<Link href="/projects/custom">Start your project</Link>} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TIMELINE.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-xl bg-background/60 p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-brand-primary" />
                <p className="mt-2 text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </FadeInSection>

      <TrustStrip />

      <BrandStrip brands={brands} />
    </div>
  );
}

function pickFeatured(products: Product[], limit: number): Product[] {
  return [...products]
    .filter((p) => p.images.length > 0)
    .sort((a, b) => b.regularPrice - b.price - (a.regularPrice - a.price))
    .slice(0, limit);
}
