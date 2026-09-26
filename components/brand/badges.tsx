import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductFormat, ProductLanguage, ProductType } from "@/lib/types";

export function CourseCodeChip({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-brand-primary/25 bg-brand-primary/10 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-brand-primary",
        className
      )}
    >
      {code}
    </span>
  );
}

const TYPE_LABEL: Record<ProductType, string> = {
  HelpBook: "Help Book",
  SolvedAssignment: "Solved Assignment",
  GuessPaper: "Guess Paper",
  QuestionPaper: "Question Paper",
  Project: "Project",
  Combo: "Combo",
  Other: "Study Material",
};

export function TypeBadge({ type }: { type: ProductType }) {
  return <Badge variant="secondary">{TYPE_LABEL[type]}</Badge>;
}

export function FormatBadge({ format }: { format: ProductFormat }) {
  return <Badge variant="outline">{format === "Both" ? "Soft + Hard Copy" : format === "SoftCopy" ? "Soft Copy (PDF)" : "Hard Copy"}</Badge>;
}

export function LanguageBadge({ language }: { language: ProductLanguage | null }) {
  if (!language) return null;
  return <Badge variant="outline">{language === "Both" ? "English + Hindi" : language}</Badge>;
}
