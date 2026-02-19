"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SalesAnalytics } from "@/lib/admin/queries";

type Props = {
  data: SalesAnalytics;
};

export function AnalyticsCharts({ data }: Props) {
  const ordersData = data.ordersLast7Days.map((d) => ({
    name: d.date.slice(5),
    orders: d.count,
  }));

  const revenueData = data.revenueLast7Days.map((d) => ({
    name: d.date.slice(5),
    revenue: d.amount,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium text-neutral-700">Orders Last 7 Days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number | undefined) => [value ?? 0, "Orders"]}
              />
              <Bar dataKey="orders" fill="#404040" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium text-neutral-700">Revenue Last 7 Days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#737373" />
              <YAxis tick={{ fontSize: 12 }} stroke="#737373" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#525252" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium text-neutral-700">Top Selling Products</h3>
        {data.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">No sales data yet</p>
        ) : (
          <div className="space-y-2">
            {data.topProducts.map((p) => (
              <div
                key={p.productId}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-neutral-700">{p.productName}</span>
                <span className="text-sm text-neutral-500">{p.qty} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
