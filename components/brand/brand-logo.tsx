"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/types";

/**
 * Renders the brand's real logo; falls back to an initials badge if the file is missing or
 * fails to load. The native `error` event on <img> doesn't bubble, so if the browser starts
 * (and fails) the request from the server-rendered HTML before React hydrates and attaches
 * the `onError` listener, the event is missed entirely — `img.complete && naturalWidth === 0`
 * on mount (via the ref callback, which runs before paint) catches that already-failed case.
 */
export function BrandLogo({ brand, className }: { brand: Pick<Brand, "name" | "logo" | "colors">; className?: string }) {
  const [failed, setFailed] = useState(false);
  const checkedRef = useRef(false);

  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (!img || checkedRef.current) return;
    checkedRef.current = true;
    if (img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

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
  return <img ref={imgRef} src={brand.logo} alt={brand.name} className={cn("object-contain", className)} onError={() => setFailed(true)} />;
}
