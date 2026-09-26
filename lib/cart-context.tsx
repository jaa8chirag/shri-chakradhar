"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BrandId } from "./types";

export interface CartItem {
  productId: string;
  brandId: BrandId;
  slug: string;
  title: string;
  courseCode: string | null;
  price: number;
  regularPrice: number;
  image: string | null;
  format: string;
  language: string | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sc-demo-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore — private browsing / blocked storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + qty } : i));
        }
        return [...prev, { ...item, qty }];
      });
    };
    const removeItem: CartContextValue["removeItem"] = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));
    const setQty: CartContextValue["setQty"] = (productId, qty) =>
      setItems((prev) => (qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))));
    const clear = () => setItems([]);
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    return { items, addItem, removeItem, setQty, clear, totalItems, totalPrice };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
