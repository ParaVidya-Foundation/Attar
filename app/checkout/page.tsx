"use client";

import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
