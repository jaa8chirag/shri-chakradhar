import Link from "next/link";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { getBrands, getStats } from "@/lib/data";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Card } from "@/components/ui/card";

export default async function DemoLandingPage() {
  const brands = await getBrands();
  const stats = await getStats();
  const rawTotal = Object.values(stats.perBrand).reduce((sum, b) => sum + b.productCount, 0);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shri Chakradhar Publication Pvt Ltd</p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight sm:text-5xl">One platform, five brands</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            All five storefronts below run on one unified catalog, one order system and one admin — instead of five separate WordPress
            sites with duplicated products and scattered orders.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Unique products" value={stats.totalUniqueProducts.toLocaleString("en-IN")} />
          <Stat label="Shared across 2+ brands" value={stats.sharedAcross2Plus.toLocaleString("en-IN")} />
          <Stat label="Duplicate listings merged" value={stats.mergeLog.length.toLocaleString("en-IN")} />
          <Stat label="Before: raw listings across 5 sites" value={rawTotal.toLocaleString("en-IN")} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/s/${brand.id}`} data-brand={brand.id} className="group">
              <Card className="flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <BrandLogo brand={brand} className="h-10 w-10" />
                <h2 className="mt-4 font-heading font-semibold">{brand.name}</h2>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{brand.tagline}</p>
                <span className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-primary">
                  Visit storefront <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}

          <Link href="/admin" className="group">
            <Card className="flex h-full flex-col border-dashed bg-muted/30 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-heading font-semibold">Unified Admin</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">One dashboard for all 5 brands — catalog, orders, customers and project jobs.</p>
              <span className="mt-4 flex items-center gap-1 text-sm font-medium text-foreground">
                Open admin <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        </div>
      </div>

      <div className="border-t bg-background py-4 text-center text-xs text-muted-foreground">Demo by GGM Technologies</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="font-heading text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
