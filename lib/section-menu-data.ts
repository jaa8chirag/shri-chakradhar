import { SECTIONS, getProductsForSection, getSectionStartingPrice } from "./sections";
import { buildBrandMenu } from "./catalog-query";
import type { SectionMenuData } from "@/components/layout/section-mega-menu";
import type { Brand, Product } from "./types";

export function buildSectionMenuData(catalog: Product[], brands: Brand[]): SectionMenuData[] {
  return SECTIONS.map((section) => {
    const products = getProductsForSection(catalog, section.id);
    const subBrand = brands.find((b) => b.id === section.subBrandId)!;
    return {
      section,
      subBrand,
      startingPrice: getSectionStartingPrice(catalog, section.id),
      levels: buildBrandMenu(products),
    };
  });
}
