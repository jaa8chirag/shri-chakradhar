import { redirect, notFound } from "next/navigation";
import { getSectionForBrand } from "@/lib/sections";
import type { BrandId } from "@/lib/types";

const VALID_BRANDS: BrandId[] = ["shrichakradhar", "ignouproject", "ignouquestionpaper", "ignousolvedassignment", "ignoustudymaterial"];

/**
 * Legacy per-brand storefront URLs (from before the unified single-store redesign) now
 * redirect to the matching section — e.g. /s/ignouquestionpaper -> /question-papers.
 * Kept so old bookmarks/links and any hostname-based routing added later still resolve.
 */
export default async function LegacyBrandRedirect({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!VALID_BRANDS.includes(brand as BrandId)) notFound();
  if (brand === "shrichakradhar") redirect("/");

  const section = getSectionForBrand(brand as BrandId);
  redirect(section?.path ?? "/");
}
