import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { getBrands, getPages } from "@/lib/data";
import { PageHeroBand } from "@/components/home/page-hero-band";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const pages = await getPages();
  const contact = pages[masterBrand.id]?.contact;

  return (
    <div>
      <PageHeroBand brand={masterBrand} title={`Contact ${masterBrand.name}`} subtitle="We're happy to help with anything IGNOU." />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {masterBrand.phones[0] && (
            <Card className="flex items-center gap-3 p-4">
              <Phone className="h-5 w-5 text-brand-primary" />
              <a href={`tel:${masterBrand.phones[0]}`} className="text-sm font-medium">
                {masterBrand.phones[0]}
              </a>
            </Card>
          )}
          {masterBrand.email && (
            <Card className="flex items-center gap-3 p-4">
              <Mail className="h-5 w-5 text-brand-primary" />
              <a href={`mailto:${masterBrand.email}`} className="text-sm font-medium">
                {masterBrand.email}
              </a>
            </Card>
          )}
          {masterBrand.whatsapp && (
            <Card className="flex items-center gap-3 p-4">
              <MessageCircle className="h-5 w-5 text-brand-primary" />
              <a href={masterBrand.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
                Chat on WhatsApp
              </a>
            </Card>
          )}
          {masterBrand.address && (
            <Card className="flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5 shrink-0 text-brand-primary" />
              <span className="text-sm">{masterBrand.address}</span>
            </Card>
          )}
        </div>

        {contact && (
          <Card className="mt-6 overflow-x-auto p-6 sm:p-8">
            <div className="prose prose-sm max-w-none prose-headings:font-heading" dangerouslySetInnerHTML={{ __html: contact }} />
          </Card>
        )}
      </div>
    </div>
  );
}
