import { getBrands } from "@/lib/data";
import { listOrders } from "@/lib/orders-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  placed: "secondary",
  processing: "outline",
  shipped: "outline",
  delivered: "default",
};

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  const brands = await getBrands();
  const brandName = (id: string) => brands.find((b) => b.id === id)?.name ?? id;

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} orders across all 5 brands.</p>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
          <p>No orders yet.</p>
          <p className="mt-1 text-sm">Place a demo checkout in any storefront — it will appear here immediately.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Source brand</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{brandName(o.brandId)}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{o.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{o.customer.phone}</p>
                  </TableCell>
                  <TableCell className="text-sm">{o.items.reduce((s, i) => s + i.qty, 0)} items</TableCell>
                  <TableCell className="font-medium">₹{o.total.toFixed(0)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[o.status]}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
