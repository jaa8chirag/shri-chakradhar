import { getBrands, getPages } from "@/lib/data";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const pages = await getPages();
  const about = pages[masterBrand.id]?.about;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">About {masterBrand.name}</h1>
      {about ? <div className="prose prose-sm mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: about }} /> : <p className="mt-6 text-muted-foreground">{masterBrand.tagline}</p>}
    </div>
  );
}
