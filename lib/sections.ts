import type { BrandId, Product, ProductType } from "./types";

export type SectionId = "study-material" | "solved-assignments" | "question-papers" | "guess-papers" | "projects";

export interface SectionConfig {
  id: SectionId;
  path: string;
  label: string;
  navLabel: string;
  subBrandId: BrandId;
  types: ProductType[];
  keyFacts: string[];
}

/**
 * Shri Chakradhar Publication is the master brand; the other 4 original sites become
 * sections of one store, each keeping its own logo as a "sub-brand" badge. A product
 * belongs to a section by its `type` — since the master brand's own catalog already spans
 * every type, this naturally pools shrichakradhar's matching products into each section
 * alongside the specialist brand's, without needing a separate brand-union list.
 */
export const SECTIONS: SectionConfig[] = [
  {
    id: "study-material",
    path: "/study-material",
    label: "Study Material & Help Books",
    navLabel: "Study Material",
    subBrandId: "ignoustudymaterial",
    types: ["HelpBook", "Combo"],
    keyFacts: ["Guide books & combos", "English & Hindi medium", "Soft copy or hard copy"],
  },
  {
    id: "solved-assignments",
    path: "/solved-assignments",
    label: "Solved Assignments",
    navLabel: "Solved Assignments",
    subBrandId: "ignousolvedassignment",
    types: ["SolvedAssignment"],
    keyFacts: ["PDF or hard-copy booklet", "Session 2025-26 ready", "All programmes covered"],
  },
  {
    id: "question-papers",
    path: "/question-papers",
    label: "Question Papers",
    navLabel: "Question Papers",
    subBrandId: "ignouquestionpaper",
    types: ["QuestionPaper"],
    keyFacts: ["Previous years, solved", "PDF from ₹19", "Booklets available"],
  },
  {
    id: "guess-papers",
    path: "/guess-papers",
    label: "Guess Papers",
    navLabel: "Guess Papers",
    subBrandId: "shrichakradhar",
    types: ["GuessPaper"],
    keyFacts: ["Exam-focused prep", "Solved guess papers", "All levels"],
  },
  {
    id: "projects",
    path: "/projects",
    label: "Projects & Synopsis",
    navLabel: "Projects",
    subBrandId: "ignouproject",
    types: ["Project"],
    keyFacts: ["Synopsis next day", "Report in ~8 days", "Guide support for MBA/MCOM"],
  },
];

export function getSection(id: SectionId): SectionConfig {
  const section = SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}

export function getSectionForBrand(brandId: BrandId): SectionConfig | undefined {
  return SECTIONS.find((s) => s.subBrandId === brandId);
}

export function getProductsForSection(catalog: Product[], sectionId: SectionId): Product[] {
  const section = getSection(sectionId);
  // availableOn.length === 0 means admin has toggled this product off every brand — it's
  // conceptually deleted from the unified storefront (though still visible in /admin/catalog
  // so it can be toggled back on; that page must call getCatalog() directly, not this).
  return catalog.filter((p) => section.types.includes(p.type) && p.availableOn.length > 0);
}

export function getSectionStartingPrice(catalog: Product[], sectionId: SectionId): number | null {
  const products = getProductsForSection(catalog, sectionId).filter((p) => p.price > 0);
  if (products.length === 0) return null;
  return Math.min(...products.map((p) => p.price));
}
