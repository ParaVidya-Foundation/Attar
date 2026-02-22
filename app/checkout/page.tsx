"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type ProductData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image: string;
  variantId?: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (r: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

const INDIA_PHONE = /^[6-9]\d{9}$/;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeVariantId(raw: string | null): string {
  if (raw == null || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  return trimmed.startsWith("=") ? trimmed.slice(1).trim() : trimmed;
}

function validate(name: string, email: string, phone: string): FormErrors {
  const e: FormErrors = {};
  if (!name.trim() || name.trim().length < 2) e.name = "Full name is required";
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
  if (!INDIA_PHONE.test(phone.replace(/\s/g, ""))) e.phone = "Valid 10-digit Indian number required";
  return e;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-neutral-500">{message}</p>
      <Link href="/shop" className="text-sm font-medium text-neutral-900 underline">
        Browse products
      </Link>
    </div>
  );
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawVariantId = searchParams.get("variant_id");
  const variantId = sanitizeVariantId(rawVariantId);
  const qtyParam = parseInt(searchParams.get("qty") ?? searchParams.get("quantity") ?? "1", 10);
  const qty = Math.max(1, Math.min(99, qtyParam));

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (!variantId) {
      setLoading(false);
      setError("Invalid checkout request");
      return;
    }
    async function fetchData() {
      try {
        const res = await fetch(`/api/variants/${variantId}`);
        if (!res.ok) {
          setError("Product not available.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProduct({
          id: data.product.id,
          name: data.product.name,
          slug: data.product.slug,
          price: data.variant.price,
          original_price: null,
          image: data.product.image,
          variantId: data.variant.id,
        });
      } catch {
        setError("Could not load product.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [variantId]);

  if (!variantId) {
    return <EmptyState message="Invalid checkout request" />;
  }

  if (!UUID_REGEX.test(variantId)) {
    return <EmptyState message="Product not available." />;
  }


  const total = product ? product.price * qty : 0;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;
      if (submitLockRef.current) return;

      const errs = validate(name, email, phone);
      setFormErrors(errs);
      if (Object.keys(errs).length > 0) return;

      submitLockRef.current = true;
      setSubmitting(true);
      setSubmitError(null);

      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.replace(/\s/g, ""),
            variant_id: product.variantId ?? variantId,
            quantity: qty,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Order creation failed");
          return;
        }

        if (!data.keyId) {
          setSubmitError("Payment configuration error. Please try again later.");
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || typeof window === "undefined" || !window.Razorpay) {
          setSubmitError("Payment system could not load. Please try again.");
          return;
        }

        const options: Record<string, unknown> = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency ?? "INR",
          name: "Anand Ras",
          description: product.name,
          order_id: data.razorpayOrderId,
          prefill: {
            name: name.trim(),
            email: email.trim(),
            contact: phone.replace(/\s/g, ""),
          },
          theme: { color: "#1e2023" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch("/api/orders/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...response, orderId: data.orderId }),
              });

              if (verifyRes.ok) {
                router.push(`/order-success?orderId=${data.orderId}`);
              } else {
                setSubmitError("Payment verification failed. Contact support if charged.");
              }
            } catch {
              setSubmitError("Verification error. Your payment is safe — check your email.");
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          setSubmitError("Payment failed. Please try again.");
        });
        rzp.open();
      } catch {
        setSubmitError("Something went wrong. Please try again.");
      } finally {
        submitLockRef.current = false;
        setSubmitting(false);
      }
    },
    [product, name, email, phone, qty, variantId, router],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-neutral-500">{error ?? "Product not found."}</p>
        <Link href="/shop" className="text-sm font-medium text-neutral-900 underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl sm:text-3xl tracking-tight text-neutral-900">Checkout</h1>

      <div className="mt-6 sm:mt-8 grid gap-8 sm:gap-10 lg:grid-cols-2">
        {/* Product summary */}
        <div className="order-2 lg:order-1">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                <Image
                  src={product.image?.trim() || "/products/placeholder.webp"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={product.image?.startsWith("http") === true}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg text-neutral-900">{product.name}</p>
                <p className="mt-1 text-sm text-neutral-500">Qty: {qty}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-lg font-semibold text-neutral-900">{formatINR(product.price)}</p>
                  {product.original_price && product.original_price > product.price && (
                    <p className="text-sm text-neutral-400 line-through">
                      {formatINR(product.original_price)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
              <span className="text-sm text-neutral-500">Total</span>
              <span className="font-serif text-xl text-neutral-900">{formatINR(total)}</span>
            </div>
          </div>
        </div>

        {/* Guest form */}
        <form onSubmit={handleSubmit} className="order-1 space-y-4 sm:space-y-5 lg:order-2">
          <div>
            <label htmlFor="ck-name" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Full Name
            </label>
            <input
              id="ck-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-60 transition-colors"
              placeholder="Your full name"
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="ck-phone" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Phone
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-xl border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500">
                +91
              </span>
              <input
                id="ck-phone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                disabled={submitting}
                className="w-full rounded-r-xl border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-60 transition-colors"
                placeholder="9876543210"
              />
            </div>
            {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="ck-email" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="ck-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:opacity-60 transition-colors"
              placeholder="you@example.com"
            />
            {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
          </div>

          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-neutral-900 px-4 py-3 sm:py-3.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing…" : `Pay ${formatINR(total)}`}
          </button>

          <p className="text-center text-xs text-neutral-400">
            Secure payment via Razorpay. No account required.
          </p>
        </form>
      </div>
    </div>
  );
}

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
