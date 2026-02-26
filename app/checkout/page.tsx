import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const variantId = firstValue(searchParams?.variant_id)?.trim();
  const mode = firstValue(searchParams?.mode);
  const initialMode = variantId ? "single" : mode === "cart" ? "cart" : "unknown";

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
        </div>
      }
    >
      <CheckoutForm initialMode={initialMode} />
    </Suspense>
  );
}
