"use client";

import Link from "next/link";
import { Home, Grid2x2, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/study-material", icon: Grid2x2, label: "Categories" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/account", icon: User, label: "Account" },
];

export function MobileBottomNav() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 backdrop-blur lg:hidden">
      {ITEMS.map(({ href, icon: Icon, label }) => (
        <Link key={label} href={href} className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground">
          <Icon className="h-5 w-5" />
          {label === "Cart" && totalItems > 0 && (
            <span className="absolute right-1/4 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
          {label}
        </Link>
      ))}
    </nav>
  );
}
