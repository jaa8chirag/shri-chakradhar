"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import type { MenuLevel } from "@/lib/catalog-query";
import type { BrandId } from "@/lib/types";

export function MobileMenuDrawer({ brandId, menu }: { brandId: BrandId; menu: MenuLevel[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Browse</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-4 pb-6" onClick={() => setOpen(false)}>
          {menu.map((section) => (
            <div key={section.level}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                {section.level}
              </p>
              <div className="flex flex-wrap gap-2">
                {section.programmes.map((p) => (
                  <Link
                    key={p.name}
                    href={`/s/${brandId}/browse?level=${section.level}&programme=${encodeURIComponent(p.name)}`}
                    className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:border-brand-primary hover:text-brand-primary"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-1 border-t pt-4">
            <Link href={`/s/${brandId}/browse`} className="block rounded-md px-1.5 py-2 text-sm font-medium">
              Full catalog
            </Link>
            <Link href={`/s/${brandId}/about`} className="block rounded-md px-1.5 py-2 text-sm">
              About
            </Link>
            <Link href={`/s/${brandId}/contact`} className="block rounded-md px-1.5 py-2 text-sm">
              Contact
            </Link>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
