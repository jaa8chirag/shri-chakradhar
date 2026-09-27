import { getBrands, getStats } from "@/lib/data";
import { LandingContent } from "@/components/brand/landing-content";

export default async function DemoLandingPage() {
  const brands = await getBrands();
  const stats = await getStats();
  const rawTotal = Object.values(stats.perBrand).reduce((sum, b) => sum + b.productCount, 0);

  const statCards = [
    { label: "Unique products", value: stats.totalUniqueProducts },
    { label: "Shared across 2+ brands", value: stats.sharedAcross2Plus },
    { label: "Duplicate listings merged", value: stats.mergeLog.length },
    { label: "Before: raw listings across 5 sites", value: rawTotal },
  ];

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-muted/40 to-background">
      <LandingContent brands={brands} stats={statCards} />
      <div className="border-t bg-background py-4 text-center text-xs text-muted-foreground">Demo by GGM Technologies</div>
    </div>
  );
}
