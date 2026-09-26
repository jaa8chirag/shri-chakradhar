import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import type { Brand } from "@/lib/types";

export function Footer({ brand }: { brand: Brand }) {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <BrandLogo brand={brand} className="h-8 w-8" />
            <span className="font-heading font-bold">{brand.name}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{brand.tagline}</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Contact</p>
          {brand.phones[0] && (
            <a href={`tel:${brand.phones[0]}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" /> {brand.phones[0]}
            </a>
          )}
          {brand.email && (
            <a href={`mailto:${brand.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" /> {brand.email}
            </a>
          )}
          {brand.address && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {brand.address}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-foreground">Quick links</p>
          <nav className="flex flex-col gap-1.5 text-muted-foreground">
            <Link href={`/s/${brand.id}/browse`} className="hover:text-foreground">
              Browse
            </Link>
            <Link href={`/s/${brand.id}/about`} className="hover:text-foreground">
              About
            </Link>
            <Link href={`/s/${brand.id}/faq`} className="hover:text-foreground">
              FAQ
            </Link>
            <Link href={`/s/${brand.id}/contact`} className="hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {brand.name}. Demo by GGM Technologies.
      </div>
    </footer>
  );
}
