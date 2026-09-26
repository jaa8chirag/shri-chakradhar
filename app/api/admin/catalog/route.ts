import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setProductVisibility, updateProductPrice } from "@/lib/data";
import type { BrandId } from "@/lib/types";

const ALL_BRANDS: BrandId[] = ["shrichakradhar", "ignouproject", "ignouquestionpaper", "ignousolvedassignment", "ignoustudymaterial"];

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (body.action === "visibility") {
    const product = await setProductVisibility(body.productId, body.brandId as BrandId, body.visible);
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    for (const brandId of ALL_BRANDS) revalidatePath(`/s/${brandId}`, "layout");
    return NextResponse.json({ product });
  }

  if (body.action === "price") {
    const product = await updateProductPrice(body.productId, Number(body.price));
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    for (const brandId of ALL_BRANDS) revalidatePath(`/s/${brandId}`, "layout");
    return NextResponse.json({ product });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
