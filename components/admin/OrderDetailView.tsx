"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/admin/actions";
import type { OrderRow } from "@/lib/admin/queries";

const STATUS_OPTIONS = ["created", "pending", "paid", "shipped", "delivered", "failed", "cancelled"] as const;

type Props = {
  order: OrderRow & { customerEmail?: string | null };
  items: { product_id: string; variant_id: string | null; quantity: number; price: number; productName: string }[];
};

export function OrderDetailView({ order, items }: Props) {
  const [updating, setUpdating] = useState(false);

  async function handleStatusChange(status: string) {
    setUpdating(true);
    await updateOrderStatus(order.id, status);
    setUpdating(false);
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Order {order.id.slice(0, 8)}…</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-neutral-500">Customer</dt>
            <dd className="mt-0.5 text-sm font-medium text-neutral-900">{order.name || "—"}</dd>
            <dd className="text-sm text-neutral-600">{order.user_email || order.customerEmail || order.email || "—"}</dd>
          </div>
          {order.phone && (
            <div>
              <dt className="text-xs text-neutral-500">Phone</dt>
              <dd className="mt-0.5 text-sm text-neutral-700">{order.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-neutral-500">Amount</dt>
            <dd className="mt-0.5 text-sm font-medium text-neutral-900">₹{(order.amount / 100).toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Status</dt>
            <dd className="mt-0.5">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Created</dt>
            <dd className="mt-0.5 text-sm text-neutral-600">
              {new Date(order.created_at).toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-neutral-700">Order items</h3>
        <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80">
                <th className="px-4 py-3 text-left font-medium text-neutral-700">Product</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-700">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{item.productName}</td>
                  <td className="px-4 py-3 text-right text-neutral-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-neutral-700">₹{(item.price / 100).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
