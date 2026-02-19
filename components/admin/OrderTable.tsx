"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/admin/actions";
import type { OrderRow } from "@/lib/admin/queries";
import { EmptyState } from "./EmptyState";
import { ShoppingCart } from "lucide-react";

const STATUS_OPTIONS = ["created", "pending", "paid", "shipped", "delivered", "failed", "cancelled"] as const;

type Props = {
  orders: OrderRow[];
};

export function OrderTable({ orders }: Props) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    await updateOrderStatus(orderId, status);
    setUpdatingId(null);
    window.location.reload();
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-12 w-12" />}
        title="No orders yet"
        description="Orders will appear here when customers place them"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Order ID</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Customer</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Amount</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Status</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Razorpay</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
              <td className="px-4 py-3 font-mono text-xs text-neutral-600">{o.id.slice(0, 8)}…</td>
              <td className="px-4 py-3 text-neutral-700">{o.user_email || "—"}</td>
              <td className="px-4 py-3 text-neutral-700">₹{o.total_amount.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  disabled={updatingId === o.id}
                  className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                {o.razorpay_order_id ? o.razorpay_order_id.slice(0, 12) + "…" : "—"}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {new Date(o.created_at).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
