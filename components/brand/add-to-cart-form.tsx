"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { BrandId, Product } from "@/lib/types";

export function AddToCartForm({ product, brandId }: { product: Product; brandId: BrandId }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        brandId,
        slug: product.slug,
        title: product.title,
        courseCode: product.courseCodes[0] ?? null,
        price: product.price,
        regularPrice: product.regularPrice,
        image: product.images[0] ?? null,
        format: product.format,
        language: product.language,
      },
      qty
    );
    toast.success(`Added to cart`, { description: product.title });
  }

  function handleBuyNow() {
    handleAdd();
    router.push(`/s/${brandId}/cart`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button size="lg" variant="outline" onClick={handleAdd}>
        <ShoppingCart className="h-4 w-4" />
        Add to cart
      </Button>
      <Button size="lg" onClick={handleBuyNow}>
        Buy now
      </Button>
    </div>
  );
}
