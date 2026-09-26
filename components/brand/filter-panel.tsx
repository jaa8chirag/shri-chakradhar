import Link from "next/link";
import { X } from "lucide-react";
import type { Facets, CatalogFilters } from "@/lib/catalog-query";
import type { BrandId } from "@/lib/types";

const FORMAT_LABEL: Record<string, string> = { SoftCopy: "Soft Copy (PDF)", HardCopy: "Hard Copy", Both: "Both" };
const TYPE_LABEL: Record<string, string> = {
  HelpBook: "Help Book",
  SolvedAssignment: "Solved Assignment",
  GuessPaper: "Guess Paper",
  QuestionPaper: "Question Paper",
  Project: "Project",
  Combo: "Combo",
  Other: "Other",
};

function buildHref(brandId: BrandId, current: CatalogFilters & { q?: string }, key: keyof CatalogFilters, value: string) {
  const params = new URLSearchParams();
  const next = { ...current, [key]: current[key] === value ? undefined : value };
  for (const [k, v] of Object.entries(next)) {
    if (v !== undefined && v !== "") params.set(k, String(v));
  }
  params.delete("page");
  const qs = params.toString();
  return `/s/${brandId}/browse${qs ? `?${qs}` : ""}`;
}

export function FilterPanel({ brandId, facets, current }: { brandId: BrandId; facets: Facets; current: CatalogFilters }) {
  const hasActiveFilters = !!(current.level || current.type || current.format || current.language || current.session || current.programme);

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Link href={`/s/${brandId}/browse`} className="flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline">
          <X className="h-3.5 w-3.5" /> Clear all filters
        </Link>
      )}

      {facets.levels.length > 0 && (
        <FilterGroup title="Level">
          {facets.levels.map(({ value, count }) => (
            <FilterOption key={value} label={value} count={count} active={current.level === value} href={buildHref(brandId, current, "level", value)} />
          ))}
        </FilterGroup>
      )}

      {facets.types.length > 0 && (
        <FilterGroup title="Type">
          {facets.types.map(({ value, count }) => (
            <FilterOption key={value} label={TYPE_LABEL[value] ?? value} count={count} active={current.type === value} href={buildHref(brandId, current, "type", value)} />
          ))}
        </FilterGroup>
      )}

      {facets.formats.length > 0 && (
        <FilterGroup title="Format">
          {facets.formats.map(({ value, count }) => (
            <FilterOption key={value} label={FORMAT_LABEL[value] ?? value} count={count} active={current.format === value} href={buildHref(brandId, current, "format", value)} />
          ))}
        </FilterGroup>
      )}

      {facets.languages.length > 0 && (
        <FilterGroup title="Language">
          {facets.languages.map(({ value, count }) => (
            <FilterOption key={value} label={value} count={count} active={current.language === value} href={buildHref(brandId, current, "language", value)} />
          ))}
        </FilterGroup>
      )}

      {facets.sessions.length > 0 && (
        <FilterGroup title="Session">
          {facets.sessions.slice(0, 6).map(({ value, count }) => (
            <FilterOption key={value} label={value} count={count} active={current.session === value} href={buildHref(brandId, current, "session", value)} />
          ))}
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function FilterOption({ label, count, active, href }: { label: string; count: number; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
        active ? "bg-brand-primary/10 font-medium text-brand-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span className="text-xs">{count}</span>
    </Link>
  );
}
