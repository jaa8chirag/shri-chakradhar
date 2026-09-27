import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { getBrands, getPages } from "@/lib/data";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const brands = await getBrands();
  const masterBrand = brands.find((b) => b.id === "shrichakradhar")!;
  const pages = await getPages();
  const contact = pages[masterBrand.id]?.contact;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Contact {masterBrand.name}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

      {contact && <div className="prose prose-sm mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: contact }} />}
    </div>
  );
}
