import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Orders",
  robots: "noindex",
};

export default async function OrdersPage() {
  const { user, supabase } = await requireUser();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      amount,
      currency,
      created_at,
      order_items (id, quantity, price)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatAmount = (amountPaise: number, currency: string) => {
    if (currency === "INR") return `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
    return `${currency} ${(amountPaise / 100).toFixed(2)}`;
  };

  const statusColor: Record<string, string> = {
    paid: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    created: "bg-blue-50 text-blue-700 border-blue-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    processing: "bg-purple-50 text-purple-700 border-purple-200",
    refunded: "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className="min-h-[70vh] flex-1 bg-white">
      <div className="px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">My orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <ShoppingBag className="h-12 w-12 text-charcoal/30" />
            <p className="mt-4 text-sm text-charcoal/70">You haven&apos;t placed any orders yet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => {
              const items = (order.order_items as { id: string; quantity: number; price: number }[]) ?? [];
              const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-2xl border border-ash/50 p-5 transition-colors hover:border-ash"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-charcoal/60">
                        Order
                      </p>
                      <p className="font-mono text-sm text-ink">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                        statusColor[order.status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-6 text-sm text-charcoal/80">
                    <div>
                      <span className="text-charcoal/50">Date: </span>
                      {formatDate(order.created_at)}
                    </div>
                    <div>
                      <span className="text-charcoal/50">Amount: </span>
                      <span className="font-medium text-ink">
                        {formatAmount(order.amount, order.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal/50">Items: </span>
                      {itemCount}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
