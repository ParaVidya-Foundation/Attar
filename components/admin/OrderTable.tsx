"use client";

import { useState } from "react";
import Link from "next/link";
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
    <>
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-neutral-600 truncate">{o.id.slice(0, 8)}…</p>
                <p className="mt-1 font-medium text-neutral-900">{o.name || "—"}</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900 shrink-0">
                ₹{(o.amount / 100).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-neutral-700">{o.user_email || o.email || "—"}</p>
              {o.phone && <p className="text-xs text-neutral-400">{o.phone}</p>}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <select
                value={o.status}
                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                disabled={updatingId === o.id}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-600 shrink-0">
                {new Date(o.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Order ID</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-neutral-600 hover:text-neutral-900 hover:underline">
                    {o.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{o.name || "—"}</td>
                <td className="px-4 py-3">
                  <div className="text-sm text-neutral-700">{o.user_email || o.email || "—"}</div>
                  {o.phone && <div className="text-xs text-neutral-400">{o.phone}</div>}
                </td>
                <td className="px-4 py-3 text-neutral-700">₹{(o.amount / 100).toLocaleString("en-IN")}</td>
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
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(o.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
