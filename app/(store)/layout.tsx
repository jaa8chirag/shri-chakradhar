import { getBrands, getCatalog } from "@/lib/data";
import { buildSectionMenuData } from "@/lib/section-menu-data";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemoPill } from "@/components/layout/demo-pill";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { WhatsAppButton } from "@/components/brand/whatsapp-button";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const brands = await getBrands();
  const catalog = await getCatalog();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const sectionData = buildSectionMenuData(catalog, brands);

  const programmeCounts = new Map<string, number>();
  for (const p of catalog) {
    if (p.programme) programmeCounts.set(p.programme, (programmeCounts.get(p.programme) ?? 0) + 1);
  }
  const topProgrammes = Array.from(programmeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([name]) => name);

  return (
    <div className="flex min-h-full flex-1 flex-col" data-brand={masterBrand.id} style={{ "--brand-primary": masterBrand.colors.primary, "--brand-secondary": masterBrand.colors.secondary } as React.CSSProperties}>
      <SiteHeader masterBrand={masterBrand} sectionData={sectionData} topProgrammes={topProgrammes} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <SiteFooter masterBrand={masterBrand} />
      {masterBrand.whatsapp && <WhatsAppButton number={masterBrand.phones[0] ?? "919354637830"} message="Hi, I have a question" />}
      <DemoPill />
      <MobileBottomNav />
    </div>
  );
}
