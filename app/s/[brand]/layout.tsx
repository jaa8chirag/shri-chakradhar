import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getBrand, getBrands } from "@/lib/data";
import { Header } from "@/components/brand/header";
import { MobileBottomNav } from "@/components/brand/mobile-bottom-nav";
import { WhatsAppButton } from "@/components/brand/whatsapp-button";
import { Footer } from "@/components/brand/footer";
import type { BrandId } from "@/lib/types";

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ brand: b.id }));
}

export default async function BrandLayout({ children, params }: { children: React.ReactNode; params: Promise<{ brand: string }> }) {
  const { brand: brandId } = await params;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const brandStyle = { "--brand-primary": brand.colors.primary, "--brand-secondary": brand.colors.secondary } as CSSProperties;

  return (
    <div data-brand={brand.id} style={brandStyle} className="flex min-h-full flex-1 flex-col">
      <Header brand={brand} />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <Footer brand={brand} />
      {brand.whatsapp && <WhatsAppButton number={brand.phones[0] ?? "919354637830"} message={`Hi, I have a question about ${brand.name}`} />}
      <MobileBottomNav brandId={brand.id} />
    </div>
  );
}
