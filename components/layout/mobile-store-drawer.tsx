"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BrandLogo } from "@/components/brand/brand-logo";
import type { SectionMenuData } from "./section-mega-menu";
import type { Brand } from "@/lib/types";

export function MobileStoreDrawer({ data, masterBrand }: { data: SectionMenuData[]; masterBrand: Brand }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></Button>} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Shop by category</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[65vh] overflow-y-auto px-4 pb-4" onClick={(e) => (e.target as HTMLElement).tagName === "A" && setOpen(false)}>
          <Accordion className="w-full">
            {data.map(({ section, subBrand, levels }) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <BrandLogo brand={subBrand} className="h-5 w-5 rounded" />
                    {section.label}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-1">
                    {levels.map((l) => (
                      <div key={l.level}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{l.level}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {l.programmes.slice(0, 10).map((p) => (
                            <Link
                              key={p.name}
                              href={`${section.path}?level=${l.level}&programme=${encodeURIComponent(p.name)}`}
                              className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {p.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Link href={section.path} className="block text-sm font-medium text-brand-primary">
                      View all {section.navLabel} →
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-4 space-y-1 border-t pt-4">
            <Link href="/combos" className="block rounded-md px-1.5 py-2 text-sm">
              Combos
            </Link>
            <Link href="/offers" className="block rounded-md px-1.5 py-2 text-sm">
              Offers
            </Link>
          </div>

          <div className="mt-4 space-y-2 border-t pt-4">
            {masterBrand.phones[0] && (
              <a href={`tel:${masterBrand.phones[0]}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" /> {masterBrand.phones[0]}
              </a>
            )}
            {masterBrand.whatsapp && (
              <a href={masterBrand.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
