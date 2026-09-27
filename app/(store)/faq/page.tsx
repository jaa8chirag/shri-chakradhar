import { getBrands, getPages } from "@/lib/data";
import { PageHeroBand } from "@/components/home/page-hero-band";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const pages = await getPages();
  const faq = pages[masterBrand.id]?.faq;
  const policies = pages[masterBrand.id]?.policies ?? [];

  return (
    <div>
      <PageHeroBand brand={masterBrand} title="Frequently Asked Questions" subtitle="Everything about ordering, delivery and support." />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Card className="overflow-x-auto p-6 sm:p-8">
          {faq ? (
            <div className="prose prose-sm max-w-none prose-headings:font-heading prose-table:w-full" dangerouslySetInnerHTML={{ __html: faq }} />
          ) : (
            <p className="text-muted-foreground">No FAQ page found yet.</p>
          )}
        </Card>

        {policies.length > 0 && (
          <Card className="mt-8 p-2 sm:p-4">
            <h2 className="px-4 pt-4 font-heading text-xl font-bold">Policies</h2>
            <Accordion className="w-full px-2">
              {policies.map((p) => (
                <AccordionItem key={p.title} value={p.title}>
                  <AccordionTrigger className="text-sm font-medium">{p.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none overflow-x-auto prose-headings:font-heading" dangerouslySetInnerHTML={{ __html: p.content }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}
      </div>
    </div>
  );
}
