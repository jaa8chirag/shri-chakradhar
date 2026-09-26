"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Brand, BrandId } from "@/lib/types";

const SHORT_LABEL: Record<string, string> = {
  shrichakradhar: "SC",
  ignouproject: "PRJ",
  ignouquestionpaper: "QP",
  ignousolvedassignment: "SA",
  ignoustudymaterial: "SM",
};

export function VisibilityToggle({ productId, availableOn, brands }: { productId: string; availableOn: BrandId[]; brands: Brand[] }) {
  const [active, setActive] = useState(new Set(availableOn));
  const [, startTransition] = useTransition();

  function toggle(brandId: BrandId) {
    const next = new Set(active);
    const willBeVisible = !next.has(brandId);
    if (willBeVisible) next.add(brandId);
    else next.delete(brandId);
    setActive(next);

    startTransition(async () => {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "visibility", productId, brandId, visible: willBeVisible }),
      });
      if (!res.ok) {
        setActive(active); // revert on failure
        toast.error("Failed to update visibility");
      }
    });
  }

  return (
    <div className="flex gap-1">
      {brands
        .filter((b) => !b.isServiceBrand)
        .map((brand) => (
          <button
            key={brand.id}
            onClick={() => toggle(brand.id)}
            title={brand.name}
            className={cn(
              "flex h-6 w-8 items-center justify-center rounded text-[10px] font-semibold transition-colors",
              active.has(brand.id) ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground/50"
            )}
          >
            {SHORT_LABEL[brand.id] ?? brand.id.slice(0, 2).toUpperCase()}
          </button>
        ))}
    </div>
  );
}
