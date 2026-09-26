"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DELIVERY_OPTIONS = [
  { value: "digital", label: "Instant download (PDF)", price: 0 },
  { value: "standard", label: "Standard delivery (4-6 days)", price: 49 },
  { value: "express", label: "Express delivery (1-2 days)", price: 99 },
] as const;

export default function CheckoutPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: brandId } = use(params);
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();
  const brandItems = items.filter((i) => i.brandId === brandId);
  const [delivery, setDelivery] = useState<(typeof DELIVERY_OPTIONS)[number]["value"]>("digital");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", pincode: "" });

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.value === delivery)?.price ?? 0;
  const brandSubtotal = brandItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = brandSubtotal + deliveryFee;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          items: brandItems.map((i) => ({ productId: i.productId, title: i.title, courseCode: i.courseCode, price: i.price, qty: i.qty, format: i.format, language: i.language })),
          customer: form,
          deliveryOption: delivery,
          total,
        }),
      });
      const { order } = await res.json();
      clear();
      router.push(`/s/${brandId}/order-confirmation?orderId=${order.id}`);
    } finally {
      setPlacing(false);
    }
  }

  if (brandItems.length === 0) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 text-muted-foreground">Your cart is empty.</div>;
  }

  return (
    <form onSubmit={handlePay} className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-bold">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-heading font-semibold">Delivery address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
              <Field label="Phone" type="tel" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required className="sm:col-span-2" />
              <Field label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} required className="sm:col-span-2" />
              <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} required />
              <Field label="Pincode" value={form.pincode} onChange={(v) => setForm((f) => ({ ...f, pincode: v }))} required />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-heading font-semibold">Delivery options</h2>
            <RadioGroup value={delivery} onValueChange={(v) => setDelivery(v as typeof delivery)} className="mt-4 space-y-3">
              {DELIVERY_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center justify-between rounded-lg border p-3 has-[[data-checked]]:border-brand-primary">
                  <span className="flex items-center gap-3">
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm">{opt.label}</span>
                  </span>
                  <span className="text-sm font-medium">{opt.price === 0 ? "Free" : `₹${opt.price}`}</span>
                </label>
              ))}
            </RadioGroup>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20 p-5">
            <h2 className="font-heading font-semibold">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              {brandItems.map((i) => (
                <div key={i.productId} className="flex justify-between text-muted-foreground">
                  <span className="line-clamp-1 pr-2">
                    {i.title} × {i.qty}
                  </span>
                  <span className="shrink-0">₹{(i.price * i.qty).toFixed(0)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-muted-foreground">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-heading text-base font-bold text-foreground">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-5 w-full bg-[#3395FF] hover:bg-[#3395FF]/90" disabled={placing}>
              {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Pay ₹{total.toFixed(0)} (Razorpay demo)
            </Button>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Demo checkout — no real payment is processed
            </p>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 text-xs text-muted-foreground">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
