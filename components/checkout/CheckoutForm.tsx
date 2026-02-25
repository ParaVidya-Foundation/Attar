"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

const MIN_ORDER_PAISE = 0;

type ProductData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image: string;
  variantId?: string;
};

const INDIA_PHONE = /^[6-9]\d{9}$/;
const checkoutSchema = z.object({
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(INDIA_PHONE, "Valid 10-digit Indian number required"),
  address_line1: z.string().min(1, "Address line 1 is required").max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  pincode: z.string().min(1, "Pincode is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

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
    s.async = true;
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeVariantId(raw: string | null): string {
  if (raw == null || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  return trimmed.startsWith("=") ? trimmed.slice(1).trim() : trimmed;
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

/* -------------------------------------------------------------------------- */
/* ------------------------------ CheckoutForm ------------------------------ */
/* -------------------------------------------------------------------------- */

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawVariantId = searchParams.get("variant_id");
  const variantId = sanitizeVariantId(rawVariantId);
  const qtyParam = parseInt(searchParams.get("qty") ?? searchParams.get("quantity") ?? "1", 10);
  const qty = Math.max(1, Math.min(99, isNaN(qtyParam) ? 1 : qtyParam));

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitLockRef = useRef(false);
  const autoFilledRef = useRef(false);

  // Preconnect Razorpay for perf
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://checkout.razorpay.com";
    link.crossOrigin = "";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch {}
    };
  }, []);

  // Redirect to shop when variant_id is missing (invalid checkout URL)
  useEffect(() => {
    if (!rawVariantId?.trim() || !sanitizeVariantId(rawVariantId)) {
      router.replace("/shop");
      return;
    }
  }, [rawVariantId, router]);

  // Fetch product
  useEffect(() => {
    if (!variantId) {
      setLoading(false);
      setError("Invalid checkout request");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/variants/${variantId}`);
        if (cancelled) return;
        if (!res.ok) {
          setError("Product not available.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        const imageUrl =
          data.product.image && String(data.product.image).trim()
            ? String(data.product.image).trim()
            : PLACEHOLDER_IMAGE_URL;
        setProduct({
          id: data.product.id,
          name: data.product.name,
          slug: data.product.slug,
          price: data.variant.price,
          original_price: null,
          image: imageUrl,
          variantId: data.variant.id,
        });
      } catch {
        if (!cancelled) setError("Could not load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [variantId]);

  // Auto-fill from logged-in user (once)
  useEffect(() => {
    if (autoFilledRef.current || !variantId) return;
    autoFilledRef.current = true;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) setName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
    })();
  }, [variantId]);

  if (!variantId) {
    return null;
  }

  if (!UUID_REGEX.test(variantId)) {
    return <EmptyState message="Product not available." />;
  }

  const total = product ? product.price * qty : 0;
  const canPay = total >= MIN_ORDER_PAISE && !submitting && product;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product || submitLockRef.current) return;

      const effectiveVariantId = (product.variantId ?? variantId)?.trim();
      if (!effectiveVariantId || !UUID_REGEX.test(effectiveVariantId)) {
        setSubmitError("Invalid checkout request");
        return;
      }

      if (total < 0) {
        setSubmitError("Invalid order amount");
        return;
      }

      const raw = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\s/g, ""),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country.trim(),
      };
      const parsed = checkoutSchema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
        const err = parsed.error;
        if (err instanceof z.ZodError) {
          err.issues.forEach((issue: z.ZodIssue) => {
            const path = issue.path[0] as keyof CheckoutFormData;
            if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
          });
        }
        setFormErrors(fieldErrors);
        return;
      }
      setFormErrors({});
      submitLockRef.current = true;
      setSubmitting(true);
      setSubmitError(null);

      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            variant_id: effectiveVariantId,
            quantity: qty,
            address_line1: parsed.data.address_line1,
            address_line2: parsed.data.address_line2,
            city: parsed.data.city,
            state: parsed.data.state,
            pincode: parsed.data.pincode,
            country: parsed.data.country,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Order creation failed");
          return;
        }

        if (!data.keyId || !data.razorpayOrderId || data.amount == null || Number(data.amount) < 100) {
          setSubmitError("Payment configuration error. Please try again later.");
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || typeof window === "undefined" || !window.Razorpay) {
          setSubmitError("Payment system could not load. Please try again.");
          return;
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        const logoUrl =
          typeof siteUrl === "string" && siteUrl.startsWith("https://")
            ? `${siteUrl.replace(/\/+$/, "")}/logo.png`
            : undefined;

        const options: Record<string, unknown> = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency ?? "INR",
          name: "Anand Ras",
          description: product.name,
          order_id: data.razorpayOrderId,
          prefill: {
            name: parsed.data.name,
            email: parsed.data.email,
            contact: parsed.data.phone,
          },
          theme: { color: "#1e2023" },
          ...(logoUrl ? { image: logoUrl } : {}),
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
    [
      product,
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      qty,
      variantId,
      total,
      router,
    ],
  );

  /* ----------------------- Loading + Error states (UI) ---------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
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

  /* -------------------------------- Render --------------------------------- */

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight text-neutral-900">Checkout</h1>
        <div className="text-sm text-neutral-500">Secure • Fast • Best</div>
      </header>

      <main className="grid gap-8 lg:grid-cols-3">
        {/* FORM - left on mobile, center on desktop */}
        <form
          onSubmit={handleSubmit}
          className="order-2 lg:order-1 lg:col-span-2 space-y-6"
          aria-labelledby="checkout-form-heading"
        >
          <h2 id="checkout-form-heading" className="sr-only">
            Checkout form
          </h2>

          {/* Customer */}
          <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">Customer</h3>
              <span className="text-xs text-neutral-400">Step 1</span>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Full Name</span>
                <input
                  id="ck-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                  placeholder="Your full name"
                  aria-invalid={!!formErrors.name}
                  aria-describedby={formErrors.name ? "err-name" : undefined}
                />
                {formErrors.name && (
                  <p id="err-name" className="mt-1 text-xs text-red-600">
                    {formErrors.name}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Email</span>
                <input
                  id="ck-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                  placeholder="you@example.com"
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? "err-email" : undefined}
                />
                {formErrors.email && (
                  <p id="err-email" className="mt-1 text-xs text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Phone</span>
                <div className="mt-1 flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
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
                    className="w-full rounded-r-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                    placeholder="9876543210"
                    aria-invalid={!!formErrors.phone}
                    aria-describedby={formErrors.phone ? "err-phone" : undefined}
                  />
                </div>
                {formErrors.phone && (
                  <p id="err-phone" className="mt-1 text-xs text-red-600">
                    {formErrors.phone}
                  </p>
                )}
              </label>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-xl border border-neutral-100 bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">Shipping Address</h3>
              <span className="text-xs text-neutral-400">Step 2</span>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-xs font-medium text-neutral-700">Address Line 1</span>
                <input
                  id="ck-addr1"
                  type="text"
                  autoComplete="address-line1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  disabled={submitting}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                  placeholder="Street, building"
                  aria-invalid={!!formErrors.address_line1}
                  aria-describedby={formErrors.address_line1 ? "err-addr1" : undefined}
                />
                {formErrors.address_line1 && (
                  <p id="err-addr1" className="mt-1 text-xs text-red-600">
                    {formErrors.address_line1}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-xs font-medium text-neutral-700">
                  Address Line 2 <span className="text-neutral-400">(optional)</span>
                </span>
                <input
                  id="ck-addr2"
                  type="text"
                  autoComplete="address-line2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  disabled={submitting}
                  className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                  placeholder="Landmark, floor"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-neutral-700">City</span>
                  <input
                    id="ck-city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={submitting}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                    placeholder="City"
                    aria-invalid={!!formErrors.city}
                    aria-describedby={formErrors.city ? "err-city" : undefined}
                  />
                  {formErrors.city && (
                    <p id="err-city" className="mt-1 text-xs text-red-600">
                      {formErrors.city}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-neutral-700">State</span>
                  <input
                    id="ck-state"
                    type="text"
                    autoComplete="address-level1"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={submitting}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                    placeholder="State"
                    aria-invalid={!!formErrors.state}
                    aria-describedby={formErrors.state ? "err-state" : undefined}
                  />
                  {formErrors.state && (
                    <p id="err-state" className="mt-1 text-xs text-red-600">
                      {formErrors.state}
                    </p>
                  )}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-neutral-700">Pincode</span>
                  <input
                    id="ck-pincode"
                    type="text"
                    autoComplete="postal-code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    disabled={submitting}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                    placeholder="110001"
                    aria-invalid={!!formErrors.pincode}
                    aria-describedby={formErrors.pincode ? "err-pincode" : undefined}
                  />
                  {formErrors.pincode && (
                    <p id="err-pincode" className="mt-1 text-xs text-red-600">
                      {formErrors.pincode}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-neutral-700">Country</span>
                  <input
                    id="ck-country"
                    type="text"
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={submitting}
                    className="mt-1 w-full rounded-md border border-neutral-200 px-3 py-2 text-neutral-900 placeholder:text-neutral-400 outline-none transition duration-150 transform-gpu focus:scale-[1.001] focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                    placeholder="India"
                    aria-invalid={!!formErrors.country}
                    aria-describedby={formErrors.country ? "err-country" : undefined}
                  />
                  {formErrors.country && (
                    <p id="err-country" className="mt-1 text-xs text-red-600">
                      {formErrors.country}
                    </p>
                  )}
                </label>
              </div>
            </div>
          </section>

          {/* Error & Pay CTA */}
          <div className="space-y-3">
            <div role="status" aria-live="polite">
              {submitError && (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canPay}
              className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-transform duration-150 transform-gpu hover:scale-[1.01] active:scale-[0.995] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Pay</span>
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processing…
                </>
              ) : (
                `Pay ${formatINR(total)}`
              )}
            </button>

            <p className="text-center text-xs text-neutral-400">
              Secure payment via Razorpay
            </p>
          </div>
        </form>

        {/* ORDER SUMMARY - right column */}
        <aside className="order-1 lg:order-2 lg:col-span-1">
          <div className="sticky top-6 space-y-4">
              <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-neutral-50">
                  {(() => {
                    const src =
                      product.image && product.image.trim().length > 0
                        ? product.image.trim()
                        : PLACEHOLDER_IMAGE_URL;
                    return (
                  <Image
                      src={src}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized={src.startsWith("http")}
                    />
                    );
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg text-neutral-900 truncate">{product.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">Qty: {qty}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Subtotal</span>
                  <span className="text-sm font-medium text-neutral-900">
                    {formatINR(product.price * qty)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Shipping</span>
                  <span className="text-sm text-neutral-500">Free</span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-sm text-neutral-500">Total</span>
                  <span className="font-heading text-xl text-neutral-900">{formatINR(total)}</span>
                </div>

                {total < 0 && (
                  <p className="mt-3 text-xs text-amber-700">Invalid order amount</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-100 bg-white p-4 text-sm text-neutral-600">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 flex-none text-neutral-400" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2v6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 12a5 5 0 11-10 0 5 5 0 0110 0z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <div className="font-medium text-neutral-800">Secure payment</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    We use Razorpay for encrypted transactions.
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-neutral-400">
              By placing your order you agree to our{" "}
              <Link href="/terms" className="text-neutral-900 underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-neutral-900 underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
