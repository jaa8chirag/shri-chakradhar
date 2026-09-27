import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setProductVisibility, updateProductPrice } from "@/lib/data";
import { SECTIONS } from "@/lib/sections";
import type { BrandId, Product } from "@/lib/types";

/** Revalidates every place this product could be shown: its own page, its section, and the cross-cutting listing pages. */
function revalidateProduct(product: Product) {
  revalidatePath(`/product/${product.slug}`);
  const section = SECTIONS.find((s) => s.types.includes(product.type));
  if (section) revalidatePath(section.path);
  revalidatePath("/");
  revalidatePath("/combos");
  revalidatePath("/offers");
  revalidatePath("/search");
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (body.action === "visibility") {
    const product = await setProductVisibility(body.productId, body.brandId as BrandId, body.visible);
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    revalidateProduct(product);
    return NextResponse.json({ product });
  }

  if (body.action === "price") {
    const product = await updateProductPrice(body.productId, Number(body.price));
    if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
    revalidateProduct(product);
    return NextResponse.json({ product });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
