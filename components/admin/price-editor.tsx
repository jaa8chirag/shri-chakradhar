"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil } from "lucide-react";

export function PriceEditor({ productId, price }: { productId: string; price: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(price));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "price", productId, price: value }),
    });
    setSaving(false);
    setEditing(false);
    if (res.ok) toast.success("Price updated — live on all storefronts");
    else toast.error("Failed to update price");
  }

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm hover:text-brand-primary">
        ₹{price} <Pencil className="h-3 w-3 opacity-50" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">₹</span>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="w-16 rounded border px-1.5 py-0.5 text-sm"
        autoFocus
        disabled={saving}
      />
      <button onClick={save} disabled={saving} className="text-emerald-600">
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}
