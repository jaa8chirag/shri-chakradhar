import { getBrands, getPages } from "@/lib/data";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const pages = await getPages();
  const faq = pages[masterBrand.id]?.faq;
  const policies = pages[masterBrand.id]?.policies ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Frequently Asked Questions</h1>
      {faq ? <div className="prose prose-sm mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: faq }} /> : <p className="mt-6 text-muted-foreground">No FAQ page found yet.</p>}

      {policies.length > 0 && (
        <div className="mt-12 space-y-8 border-t pt-8">
          <h2 className="font-heading text-xl font-bold">Policies</h2>
          {policies.map((p) => (
            <div key={p.title}>
              <h3 className="font-heading font-semibold">{p.title}</h3>
              <div className="prose prose-sm mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: p.content }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
