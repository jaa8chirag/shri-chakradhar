"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { BrandId } from "@/lib/types";

export function SearchBar({ brandId, size = "default" }: { brandId: BrandId; size?: "default" | "large" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/s/${brandId}/search?q=${encodeURIComponent(value.trim())}`);
  }

  useEffect(() => {
    function handleShortcut(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by course code (e.g. MMPC 001, BEGC 134)…"
        className={size === "large" ? "h-14 rounded-2xl pl-11 pr-4 text-base shadow-sm" : "h-10 rounded-full pl-9 pr-4"}
      />
    </form>
  );
}
