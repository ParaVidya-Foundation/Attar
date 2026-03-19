import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Check } from "lucide-react";
import RecommendedProductsSection from "@/components/order/RecommendedProductsSection";
import { getOrderById, type OrderSuccessData } from "@/lib/orders/service";

export const metadata: Metadata = {
  title: "Order Confirmed | Anand Rasa",
  robots: "noindex",
};

type PageProps = {
  searchParams: Promise<{ order_id?: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amountPaise: number, currency: string) {
  if (currency === "INR") return `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
  return `${currency} ${(amountPaise / 100).toFixed(2)}`;
}

function OrderStatusTimeline({ status }: { status: string }) {
  const progressByStatus: Record<string, number> = {
    created: 1,
    pending: 1,
    paid: 2,
    processing: 3,
    shipped: 4,
    delivered: 5,
    // Other statuses: keep them within the earliest sensible step.
    cancelled: 1,
    failed: 1,
    refunded: 1,
  };

  const progress = progressByStatus[status] ?? 1;

  const steps: { label: string; step: number }[] = [
    { label: "Order Placed", step: 1 },
    { label: "Payment Confirmed", step: 2 },
    { label: "Processing", step: 3 },
    { label: "Shipped", step: 4 },
    { label: "Delivered", step: 5 },
  ];

  return (
    <div className="border border-neutral-900/10 p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500">STATUS</p>
      <h2 className="mt-2 font-heading text-2xl text-neutral-900">Order journey</h2>

      <ol className="mt-6 space-y-4">
        {steps.map(({ label, step }) => {
          const isDone = step < progress;
          const isCurrent = step === progress;

          return (
            <li key={label} className="flex items-start gap-3">
              <div className="mt-0.5 h-7 w-7 border border-neutral-900/15 flex items-center justify-center">
                {isDone || isCurrent ? (
                  <Check className="h-4 w-4 text-[#d4b07a]" />
                ) : (
                  <span className="h-1.5 w-1.5 bg-neutral-300" />
                )}
              </div>
              <div>
                <p className={`${isCurrent ? "text-neutral-900" : "text-neutral-700"} font-medium`}>
                  {label}
                </p>
                {isCurrent && <p className="mt-1 text-sm text-neutral-600">Now</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CustomerDetailsCard({ order }: { order: OrderSuccessData }) {
  const a = order.address;
  return (
    <div className="border border-neutral-900/10 p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500">CUSTOMER</p>
      <h2 className="mt-2 font-heading text-2xl text-neutral-900">Your details</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Name</p>
          <p className="text-sm text-neutral-900">{order.customer.name || "—"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Email</p>
          <p className="text-sm text-neutral-900 break-all">{order.customer.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Phone</p>
          <p className="text-sm text-neutral-900">{order.customer.phone || "—"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500">Address</p>
          <p className="text-sm text-neutral-900">
            {a?.line1 ? a.line1 : "—"}
            {a?.line2 ? `, ${a.line2}` : ""}
            {a?.city ? `, ${a.city}` : ""}
            {a?.state ? `, ${a.state}` : ""}
            {a?.pincode ? ` - ${a.pincode}` : ""}
            {a?.country ? `, ${a.country}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderSummaryCard({ order }: { order: OrderSuccessData }) {
  return (
    <div className="mt-8 border border-neutral-900/10 p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500">SUMMARY</p>
      <h2 className="mt-2 font-heading text-2xl text-neutral-900">Order details</h2>

      <div className="mt-6 space-y-4">
        <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-neutral-500">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Variant</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-3 text-right">Price</div>
        </div>

        <div className="space-y-0">
          {order.items.map((item) => (
            <div
              key={`${item.productId}:${item.variantId}`}
              className="grid grid-cols-12 items-start gap-2 border-t border-neutral-900/10 py-4 first:border-t-0"
            >
              <div className="col-span-12 sm:col-span-5">
                <p className="text-sm font-medium text-neutral-900">
                  {item.productName || "Product unavailable"}
                </p>
              </div>
              <div className="col-span-12 sm:col-span-2">
                <p className="text-sm text-neutral-800">
                  {item.variantSizeMl ? `${item.variantSizeMl} ml` : "—"}
                </p>
              </div>
              <div className="col-span-6 sm:col-span-2 text-left sm:text-right">
                <p className="text-sm text-neutral-800">{item.quantity}</p>
              </div>
              <div className="col-span-6 sm:col-span-3 text-left sm:text-right">
                <p className="text-sm font-medium text-neutral-900">{formatAmount(item.unitPricePaise, order.currency)}</p>
              </div>
            </div>
          ))}

          {order.items.length === 0 && (
            <div className="pt-6 text-sm text-neutral-600">No items found for this order.</div>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-neutral-900/10 pt-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900">Total</p>
        <p className="text-lg font-heading text-neutral-900">{formatAmount(order.amountPaise, order.currency)}</p>
      </div>
    </div>
  );
}

function RecommendedSkeleton() {
  return (
    <section className="mt-14 border border-neutral-900/10 p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div className="w-56">
          <div className="h-3 w-24 bg-neutral-200" />
          <div className="mt-3 h-7 w-48 bg-neutral-200" />
        </div>
        <div className="h-px flex-1 bg-[#d4b07a] hidden sm:block" />
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="min-w-[220px] w-[220px] md:min-w-0 md:w-auto">
            <div className="border border-neutral-900/10">
              <div className="h-56 bg-neutral-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-neutral-200" />
                <div className="h-3 w-2/3 bg-neutral-200" />
                <div className="mt-2 h-9 bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { order_id } = await searchParams;
  const order = order_id ? await getOrderById(order_id) : null;

  if (!order) {
    return (
      <div className="bg-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <div className="border border-neutral-900/10 p-8">
            <h1 className="font-heading text-3xl text-neutral-900">Order not found</h1>
            <p className="mt-3 text-sm text-neutral-600">Please check the order id and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const SUPPORT_PHONE_E164 = "919311336643";
  const SUPPORT_EMAIL = "anandrasafragnance@gmail.com";

  const whatsAppHref = `https://wa.me/${SUPPORT_PHONE_E164}?text=${encodeURIComponent(`Hello, I'd like help with my order ${order.orderId}.`)}`;

  return (
    <div className="bg-white min-h-[70vh]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Top confirmation */}
        <section className="mx-auto max-w-xl text-center">
          <div className="mx-auto h-px w-20 bg-[#d4b07a]" />
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-neutral-900">
            Order Confirmed
          </h1>
          <p className="mt-4 text-sm text-neutral-700">Your fragrance journey begins now</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border border-neutral-900/10">
            <div className="px-4 py-4 text-left border-t-0 sm:border-r border-neutral-900/10 first:sm:border-l-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Order ID</p>
              <p className="mt-2 font-mono text-sm text-neutral-900 break-all">{order.orderId}</p>
            </div>
            <div className="px-4 py-4 text-left border-t-0 border-neutral-900/10 sm:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Date</p>
              <p className="mt-2 text-sm text-neutral-900">{formatDate(order.createdAt)}</p>
            </div>
            <div className="px-4 py-4 text-left border-t-0 border-neutral-900/10 sm:border-r-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Payment status</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{order.paymentStatus}</p>
            </div>
          </div>
        </section>

        {/* Customer + Timeline */}
        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <CustomerDetailsCard order={order} />
          <OrderStatusTimeline status={order.status} />
        </section>

        {/* Order summary */}
        <OrderSummaryCard order={order} />

        {/* Contact / Support */}
        <section className="mt-14 border border-neutral-900/10 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.24em] text-neutral-500">SUPPORT</p>
          <h2 className="mt-2 font-heading text-2xl text-neutral-900">Need help?</h2>
          <p className="mt-4 text-sm text-neutral-700">If you have any questions about your order, contact us.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="border border-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white active:scale-[0.99] no-underline"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="border border-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white active:scale-[0.99] no-underline"
            >
              Email support
            </a>
            <a
              href={`tel:+${SUPPORT_PHONE_E164}`}
              className="border border-neutral-900 px-4 py-3 text-center text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white active:scale-[0.99] no-underline"
            >
              Phone
            </a>
          </div>
        </section>

        {/* Recommended products (lazy) */}
        <Suspense fallback={<RecommendedSkeleton />}>
          <RecommendedProductsSection order={order} />
        </Suspense>

        {/* CTAs */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="border border-neutral-900 bg-neutral-900 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-black active:scale-[0.99]"
            >
              Continue Shopping
            </Link>
            <Link
              href={order.trackHref}
              className="border border-neutral-900 bg-white px-6 py-3 text-center text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 active:scale-[0.99]"
            >
              Track Order
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

