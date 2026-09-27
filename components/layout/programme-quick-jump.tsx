"use client";

import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProgrammeQuickJump({ programmes }: { programmes: string[] }) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(value: string | null) => {
        if (value && value !== "all") router.push(`/search?programme=${encodeURIComponent(value)}`);
      }}
    >
      <SelectTrigger className="w-32 shrink-0">
        <SelectValue placeholder="Programme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All programmes</SelectItem>
        {programmes.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
