import { redirect, notFound } from "next/navigation";
import { getSectionForBrand } from "@/lib/sections";
import type { BrandId } from "@/lib/types";

const VALID_BRANDS: BrandId[] = ["shrichakradhar", "ignouproject", "ignouquestionpaper", "ignousolvedassignment", "ignoustudymaterial"];

/** Any other legacy per-brand subpage (browse, cart, about, etc.) redirects to that brand's new section. */
export default async function LegacyBrandSubpathRedirect({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!VALID_BRANDS.includes(brand as BrandId)) notFound();
  if (brand === "shrichakradhar") redirect("/");

  const section = getSectionForBrand(brand as BrandId);
  redirect(section?.path ?? "/");
}
