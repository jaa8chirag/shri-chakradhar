import { getBrands, getCatalog, getStats } from "@/lib/data";
import { listOrders } from "@/lib/orders-store";
import { Card } from "@/components/ui/card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Package, Layers, ShoppingBag, IndianRupee } from "lucide-react";

export default async function AdminDashboardPage() {
  const brands = await getBrands();
  const catalog = await getCatalog();
  const stats = await getStats();
  const orders = await listOrders();

  const today = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const topCourses = new Map<string, number>();
  for (const p of catalog) {
    for (const code of p.courseCodes) topCourses.set(code, (topCourses.get(code) ?? 0) + p.availableOn.length);
  }
  const topCoursesList = Array.from(topCourses.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const revenueByBrand = brands.map((b) => ({
    brand: b.name.split(" ")[0],
    revenue: orders.filter((o) => o.brandId === b.id).reduce((sum, o) => sum + o.total, 0),
  }));

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Unified view across all 5 brands.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Total products" value={stats.totalUniqueProducts.toLocaleString("en-IN")} />
        <StatCard icon={Layers} label="Shared across 2+ brands" value={stats.sharedAcross2Plus.toLocaleString("en-IN")} />
        <StatCard icon={ShoppingBag} label="Orders today" value={String(ordersToday)} sub={`${orders.length} total`} />
        <StatCard icon={IndianRupee} label="Revenue (demo)" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-heading font-semibold">Revenue by brand (demo orders)</h2>
          <RevenueChart data={revenueByBrand} />
        </Card>

        <Card className="p-5">
          <h2 className="font-heading font-semibold">Top course codes (by listing count)</h2>
          <div className="mt-4 space-y-2">
            {topCoursesList.map(([code, count]) => (
              <div key={code} className="flex items-center justify-between text-sm">
                <span className="font-mono font-medium">{code}</span>
                <span className="text-muted-foreground">{count} listings</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-heading font-semibold">Products per brand</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {brands.map((b) => (
            <div key={b.id} className="text-center">
              <p className="font-heading text-xl font-bold">{catalog.filter((p) => p.availableOn.includes(b.id)).length.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.name.split(" ").slice(0, 2).join(" ")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <p className="mt-2 font-heading text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}
