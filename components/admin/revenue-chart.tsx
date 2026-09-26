"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { brand: string; revenue: number }[] }) {
  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return <p className="mt-8 text-center text-sm text-muted-foreground">No demo orders placed yet — place a checkout in any storefront to see it here.</p>;
  }

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="brand" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="#f2820a" maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
