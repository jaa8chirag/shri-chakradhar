import Link from "next/link";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import { SearchBar } from "./search-bar";
import type { Brand } from "@/lib/types";

export function Header({ brand }: { brand: Brand }) {
  return (
    <header data-brand={brand.id} className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <Link href={`/s/${brand.id}`} className="flex shrink-0 items-center gap-2">
          <BrandLogo brand={brand} className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="hidden font-heading text-lg font-bold text-foreground sm:inline">{brand.name}</span>
        </Link>

        <div className="hidden flex-1 sm:block">
          <SearchBar brandId={brand.id} />
        </div>

        <nav className="ml-auto hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href={`/s/${brand.id}/browse`} className="text-muted-foreground transition-colors hover:text-foreground">
            Browse
          </Link>
          <Link href={`/s/${brand.id}/about`} className="text-muted-foreground transition-colors hover:text-foreground">
            About
          </Link>
          <Link href={`/s/${brand.id}/contact`} className="text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto sm:ml-0"
          aria-label="Cart"
          nativeButton={false}
          render={
            <Link href={`/s/${brand.id}/cart`}>
              <ShoppingCart className="h-5 w-5" />
            </Link>
          }
        />
        <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="border-t px-4 py-2 sm:hidden">
        <SearchBar brandId={brand.id} />
      </div>
    </header>
  );
}
