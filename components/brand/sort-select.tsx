"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SortSelect({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "relevance";

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "relevance") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Relevance</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="newest">Newest session</SelectItem>
      </SelectContent>
    </Select>
  );
}
