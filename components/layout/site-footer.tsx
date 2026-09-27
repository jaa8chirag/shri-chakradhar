import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SECTIONS } from "@/lib/sections";
import type { Brand } from "@/lib/types";

export function SiteFooter({ masterBrand }: { masterBrand: Brand }) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <BrandLogo brand={masterBrand} className="h-9 w-auto max-w-[140px]" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{masterBrand.tagline}</p>
        </div>

        <div className="space-y-1.5 text-sm">
          <p className="font-medium text-foreground">Shop</p>
          {SECTIONS.map((s) => (
            <Link key={s.id} href={s.path} className="block text-muted-foreground hover:text-foreground">
              {s.label}
            </Link>
          ))}
          <Link href="/combos" className="block text-muted-foreground hover:text-foreground">
            Combos
          </Link>
        </div>

        <div className="space-y-1.5 text-sm">
          <p className="font-medium text-foreground">Company</p>
          <Link href="/about" className="block text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="/contact" className="block text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <Link href="/faq" className="block text-muted-foreground hover:text-foreground">
            FAQ
          </Link>
          <Link href="/admin" className="block text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Contact</p>
          {masterBrand.phones[0] && (
            <a href={`tel:${masterBrand.phones[0]}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" /> {masterBrand.phones[0]}
            </a>
          )}
          {masterBrand.email && (
            <a href={`mailto:${masterBrand.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" /> {masterBrand.email}
            </a>
          )}
          {masterBrand.address && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {masterBrand.address}
            </p>
          )}
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {masterBrand.name}. Demo by GGM Technologies.
      </div>
    </footer>
  );
}
