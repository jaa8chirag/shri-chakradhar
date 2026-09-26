import { NextRequest, NextResponse } from "next/server";
import { getProductsForBrand } from "@/lib/data";
import { buildSearchIndex, searchProducts } from "@/lib/search";
import type { BrandId } from "@/lib/types";

/**
 * Server-side search: the full per-brand catalog (thousands of products) stays on the
 * server and only the top matches are sent back, instead of shipping the whole catalog
 * JSON to the browser to run Fuse.js client-side. The Fuse index is cached per brand per
 * server instance since building it from a few thousand products isn't free.
 */
const indexCache = new Map<BrandId, ReturnType<typeof buildSearchIndex>>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get("brand") as BrandId | null;
  const q = searchParams.get("q") ?? "";

  if (!brand) {
    return NextResponse.json({ error: "brand is required" }, { status: 400 });
  }

  let index = indexCache.get(brand);
  if (!index) {
    const products = await getProductsForBrand(brand);
    index = buildSearchIndex(products);
    indexCache.set(brand, index);
  }

  const results = searchProducts(index, q, 30);
  return NextResponse.json({ results });
}
