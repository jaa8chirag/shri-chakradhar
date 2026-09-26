import { notFound } from "next/navigation";
import { getBrand, getPages } from "@/lib/data";
import type { BrandId } from "@/lib/types";

export default async function AboutPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandId } = await params;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const pages = await getPages();
  const about = pages[brand.id]?.about;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">About {brand.name}</h1>
      {about ? (
        <div className="prose prose-sm mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: about }} />
      ) : (
        <p className="mt-6 text-muted-foreground">{brand.tagline}</p>
      )}
    </div>
  );
}
