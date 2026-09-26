import { getBrands } from "@/lib/data";
import { listOrders } from "@/lib/orders-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminCustomersPage() {
  const orders = await listOrders();
  const brands = await getBrands();
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? id;

  const byPhone = new Map<string, typeof orders>();
  for (const o of orders) {
    const list = byPhone.get(o.customer.phone) ?? [];
    list.push(o);
    byPhone.set(o.customer.phone, list);
  }
  const customers = Array.from(byPhone.entries()).map(([phone, custOrders]) => ({
    phone,
    name: custOrders[0].customer.name,
    email: custOrders[0].customer.email,
    orders: custOrders,
    brandsUsed: Array.from(new Set(custOrders.map((o) => o.brandId))),
    totalSpent: custOrders.reduce((s, o) => s + o.total, 0),
  }));

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Purchase history across all 5 brands, derived from demo orders.</p>

      {customers.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          <p>No customers yet — they appear here as soon as an order is placed on any storefront.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Card key={c.phone} className="p-4">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.phone} · {c.email}
              </p>
              <p className="mt-2 font-heading text-lg font-bold">₹{c.totalSpent.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">{c.orders.length} orders</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.brandsUsed.map((b) => (
                  <Badge key={b} variant="secondary" className="text-[10px]">
                    {brandName(b)}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
