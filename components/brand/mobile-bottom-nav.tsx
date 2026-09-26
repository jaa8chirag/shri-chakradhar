import Link from "next/link";
import { Home, Grid2x2, Search, ShoppingCart, User } from "lucide-react";
import type { BrandId } from "@/lib/types";

const ITEMS = (brandId: BrandId) => [
  { href: `/s/${brandId}`, icon: Home, label: "Home" },
  { href: `/s/${brandId}/browse`, icon: Grid2x2, label: "Browse" },
  { href: `/s/${brandId}/search`, icon: Search, label: "Search" },
  { href: `/s/${brandId}/cart`, icon: ShoppingCart, label: "Cart" },
  { href: `/s/${brandId}/account`, icon: User, label: "Account" },
];

export function MobileBottomNav({ brandId }: { brandId: BrandId }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 backdrop-blur sm:hidden">
      {ITEMS(brandId).map(({ href, icon: Icon, label }) => (
        <Link key={label} href={href} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground">
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
