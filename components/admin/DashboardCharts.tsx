"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SalesAnalytics } from "@/lib/admin/queries";

type Props = { data: SalesAnalytics };

export function DashboardCharts({ data }: Props) {
  const lineData = data.revenueLast7Days.map((d) => ({
    date: d.date.slice(5),
    revenue: d.amount / 100,
  }));
  const barData = data.ordersLast7Days.map((d) => ({
    date: d.date.slice(5),
    orders: d.count,
  }));
  const topData = data.topProducts.slice(0, 10).map((p) => ({
    name: p.productName.length > 20 ? p.productName.slice(0, 20) + "…" : p.productName,
    qty: p.qty,
  }));

  return (
    <div className="space-y-10">
      <section>
        <h3 className="mb-4 text-sm font-medium text-neutral-700">Sales last 7 days (revenue)</h3>
        <div className="h-72 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 11 }} stroke="#737373" tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-medium text-neutral-700">Orders per day</h3>
        <div className="h-64 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number | undefined) => [v ?? 0, "Orders"]} />
              <Bar dataKey="orders" fill="#404040" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-medium text-neutral-700">Top products</h3>
        {topData.length === 0 ? (
          <p className="rounded-xl border border-neutral-200/80 bg-white py-8 text-center text-sm text-neutral-500">
            No sales data yet
          </p>
        ) : (
          <div className="h-80 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topData} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number | undefined) => [v ?? 0, "Sold"]} />
                <Bar dataKey="qty" fill="#525252" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
