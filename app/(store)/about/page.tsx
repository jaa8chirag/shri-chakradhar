import { getBrands, getPages } from "@/lib/data";
import { PageHeroBand } from "@/components/home/page-hero-band";
import { Card } from "@/components/ui/card";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const pages = await getPages();
  const about = pages[masterBrand.id]?.about;

  return (
    <div>
      <PageHeroBand brand={masterBrand} title={`About ${masterBrand.name}`} subtitle={masterBrand.tagline} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card className="overflow-x-auto p-6 sm:p-8">
          {about ? (
            <div className="prose prose-sm max-w-none prose-headings:font-heading prose-table:w-full" dangerouslySetInnerHTML={{ __html: about }} />
          ) : (
            <p className="text-muted-foreground">{masterBrand.tagline}</p>
          )}
        </Card>
      </div>
    </div>
  );
}
