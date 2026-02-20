import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details",
  robots: "noindex",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { user, supabase } = await requireUser();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      total_amount,
      currency,
      razorpay_order_id,
      razorpay_payment_id,
      created_at,
      updated_at,
      order_items (
        id,
        product_id,
        size_ml,
        qty,
        unit_price
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const items = (order.order_items as {
    id: number;
    product_id: string;
    size_ml: number;
    qty: number;
    unit_price: number;
  }[]) ?? [];

  const productIds = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug")
    .in("id", productIds);

  const productMap = new Map(
    (products ?? []).map((p: { id: string; name: string; slug: string }) => [p.id, p]),
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const statusColor: Record<string, string> = {
    paid: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    created: "bg-blue-50 text-blue-700 border-blue-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200",
    shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="min-h-[70vh] flex-1 bg-white">
      <div className="px-4 py-10 sm:px-6 lg:px-10">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-charcoal/60">{formatDate(order.created_at)}</p>
          </div>
          <span
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize ${
              statusColor[order.status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200"
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-ash/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ash/30 bg-neutral-50/50">
                <th className="px-5 py-3 text-left font-medium text-charcoal/70">Product</th>
                <th className="px-5 py-3 text-left font-medium text-charcoal/70">Size</th>
                <th className="px-5 py-3 text-right font-medium text-charcoal/70">Qty</th>
                <th className="px-5 py-3 text-right font-medium text-charcoal/70">Price</th>
                <th className="px-5 py-3 text-right font-medium text-charcoal/70">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const product = productMap.get(item.product_id);
                return (
                  <tr key={item.id} className="border-b border-ash/20">
                    <td className="px-5 py-4 text-ink">
                      {product ? (
                        <Link
                          href={`/product/${product.slug}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <span className="text-charcoal/50">Product unavailable</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-charcoal/70">{item.size_ml}ml</td>
                    <td className="px-5 py-4 text-right text-charcoal/70">{item.qty}</td>
                    <td className="px-5 py-4 text-right text-charcoal/70">
                      {formatAmount(item.unit_price)}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-ink">
                      {formatAmount(item.unit_price * item.qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal/60">Subtotal</span>
              <span className="font-medium text-ink">{formatAmount(order.total_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-ash/30 pt-2">
              <span className="font-medium text-ink">Total</span>
              <span className="font-serif text-lg text-ink">{formatAmount(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {order.razorpay_order_id && (
          <div className="mt-8 rounded-xl bg-neutral-50 px-5 py-4 text-xs text-charcoal/60">
            <p>
              <span className="font-medium">Razorpay Order:</span> {order.razorpay_order_id}
            </p>
            {order.razorpay_payment_id && (
              <p className="mt-1">
                <span className="font-medium">Payment ID:</span> {order.razorpay_payment_id}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
