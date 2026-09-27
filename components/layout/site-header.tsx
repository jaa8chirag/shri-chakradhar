"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Mail, Package, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { GlobalSearchBar } from "./global-search-bar";
import { ProgrammeQuickJump } from "./programme-quick-jump";
import { SectionMegaMenu, type SectionMenuData } from "./section-mega-menu";
import { MobileStoreDrawer } from "./mobile-store-drawer";
import { useCart } from "@/lib/cart-context";
import type { Brand } from "@/lib/types";

export function SiteHeader({ masterBrand, sectionData, topProgrammes }: { masterBrand: Brand; sectionData: SectionMenuData[]; topProgrammes: string[] }) {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      {/* Row 1: utility bar — collapses away on scroll */}
      <div
        className={`overflow-hidden bg-foreground text-background transition-[max-height,opacity] duration-300 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 text-xs sm:px-6">
          <div className="flex items-center gap-4 overflow-hidden">
            {masterBrand.phones[0] && (
              <a href={`tel:${masterBrand.phones[0]}`} className="hidden items-center gap-1 whitespace-nowrap opacity-90 hover:opacity-100 sm:flex">
                <Phone className="h-3 w-3" /> {masterBrand.phones[0]}
              </a>
            )}
            {masterBrand.email && (
              <a href={`mailto:${masterBrand.email}`} className="hidden items-center gap-1 whitespace-nowrap opacity-90 hover:opacity-100 md:flex">
                <Mail className="h-3 w-3" /> {masterBrand.email}
              </a>
            )}
            <span className="truncate whitespace-nowrap opacity-90">Serving IGNOU students since 2010 · Delhi</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
            <Link href="/account" className="flex items-center gap-1 opacity-90 hover:opacity-100">
              <Package className="h-3 w-3" /> Track Order
            </Link>
            <Link href="/account" className="flex items-center gap-1 opacity-90 hover:opacity-100">
              <User className="h-3 w-3" /> Login
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: main bar */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <MobileStoreDrawer data={sectionData} masterBrand={masterBrand} />
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <BrandLogo brand={masterBrand} className="h-10 w-auto max-w-[160px] sm:h-12" />
        </Link>

        <div className="hidden flex-1 items-center gap-2 sm:flex">
          <GlobalSearchBar />
          <ProgrammeQuickJump programmes={topProgrammes} />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          {masterBrand.whatsapp && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="WhatsApp"
              nativeButton={false}
              render={
                <a href={masterBrand.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                </a>
              }
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cart"
            nativeButton={false}
            render={
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            }
          />
        </div>
      </div>
      <div className="border-t px-4 py-2 sm:hidden">
        <GlobalSearchBar />
      </div>

      {/* Row 3: primary nav with mega menus */}
      <div className="hidden border-t bg-muted/20 lg:block">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionMegaMenu data={sectionData} />
        </div>
      </div>
    </header>
  );
}
