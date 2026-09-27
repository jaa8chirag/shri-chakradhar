import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listOrders } from "@/lib/orders-store";

export default async function OrderConfirmationPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams;
  const orders = await listOrders();
  const order = orders.find((o) => o.id === orderId);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
      <h1 className="mt-4 font-heading text-2xl font-bold">Order placed!</h1>
      <p className="mt-1 text-muted-foreground">{order ? `Order ${order.id} — ₹${order.total.toFixed(0)}` : "Your demo order has been recorded."}</p>

      {order && (
        <Card className="mt-6 space-y-1 p-4 text-left text-sm">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-muted-foreground">
              <span className="line-clamp-1 pr-2">
                {item.title} × {item.qty}
              </span>
              <span className="shrink-0">₹{(item.price * item.qty).toFixed(0)}</span>
            </div>
          ))}
        </Card>
      )}

      <p className="mt-6 text-xs text-muted-foreground">This is a demo order (fictional data) — it now appears in the unified admin&apos;s Orders list.</p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/">Continue shopping</Link>} />
    </div>
  );
}
