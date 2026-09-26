"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/types";

/** Renders the brand's real logo; falls back to an initials badge if the file is missing or fails to load. */
export function BrandLogo({ brand, className }: { brand: Pick<Brand, "name" | "logo" | "colors">; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = brand.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (failed || !brand.logo) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-lg font-heading text-sm font-bold text-white", className)}
        style={{ backgroundColor: brand.colors.primary }}
      >
        {initials}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={brand.logo} alt={brand.name} className={cn("object-contain", className)} onError={() => setFailed(true)} />;
}
