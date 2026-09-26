import { notFound } from "next/navigation";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { getBrand, getPages } from "@/lib/data";
import { Card } from "@/components/ui/card";
import type { BrandId } from "@/lib/types";

export default async function ContactPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandId } = await params;
  const brand = await getBrand(brandId as BrandId);
  if (!brand) notFound();

  const pages = await getPages();
  const contact = pages[brand.id]?.contact;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Contact {brand.name}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {brand.phones[0] && (
          <Card className="flex items-center gap-3 p-4">
            <Phone className="h-5 w-5 text-brand-primary" />
            <a href={`tel:${brand.phones[0]}`} className="text-sm font-medium">
              {brand.phones[0]}
            </a>
          </Card>
        )}
        {brand.email && (
          <Card className="flex items-center gap-3 p-4">
            <Mail className="h-5 w-5 text-brand-primary" />
            <a href={`mailto:${brand.email}`} className="text-sm font-medium">
              {brand.email}
            </a>
          </Card>
        )}
        {brand.whatsapp && (
          <Card className="flex items-center gap-3 p-4">
            <MessageCircle className="h-5 w-5 text-brand-primary" />
            <a href={brand.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
              Chat on WhatsApp
            </a>
          </Card>
        )}
        {brand.address && (
          <Card className="flex items-center gap-3 p-4">
            <MapPin className="h-5 w-5 shrink-0 text-brand-primary" />
            <span className="text-sm">{brand.address}</span>
          </Card>
        )}
      </div>

      {contact && <div className="prose prose-sm mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: contact }} />}
    </div>
  );
}
