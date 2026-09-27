"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CartPage() {
  const { items, setQty, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search for your course code to get started.</p>
        <Button className="mt-6" nativeButton={false} render={<Link href="/search">Browse products</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Your Cart</h1>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <Card key={item.productId} className="flex gap-4 p-4">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />}
            </div>
            <div className="flex-1">
              <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.format} {item.language ? `· ${item.language}` : ""}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center rounded-lg border">
                  <button className="flex h-8 w-8 items-center justify-center text-muted-foreground" onClick={() => setQty(item.productId, item.qty - 1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <button className="flex h-8 w-8 items-center justify-center text-muted-foreground" onClick={() => setQty(item.productId, item.qty + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-heading font-semibold">₹{(item.price * item.qty).toFixed(0)}</p>
              </div>
            </div>
            <button className="self-start text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.productId)} aria-label="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">Total ({items.reduce((s, i) => s + i.qty, 0)} items)</p>
          <p className="font-heading text-xl font-bold">₹{totalPrice.toFixed(0)}</p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/checkout">Proceed to checkout</Link>} />
      </Card>
    </div>
  );
}
