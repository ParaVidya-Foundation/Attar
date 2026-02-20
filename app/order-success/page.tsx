"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="mt-6 font-serif text-3xl tracking-tight text-neutral-900">
          Order Confirmed
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          Thank you for your purchase. Your payment has been received and your order is being
          processed.
        </p>

        {orderId && (
          <div className="mt-6 rounded-xl bg-neutral-50 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Order ID
            </p>
            <p className="mt-1 font-mono text-sm text-neutral-700">
              {orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-neutral-400">
          A confirmation will be sent to your email shortly.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/shop"
            className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
