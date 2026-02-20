"use client";

import { useCallback, useRef, useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: unknown) => void) => void;
    };
  }
}

type CheckoutItem = {
  productId: string;
  size_ml: number;
  qty: number;
};

type CheckoutResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type UseRazorpayCheckoutReturn = {
  loading: boolean;
  error: string | null;
  startCheckout: (items: CheckoutItem[]) => Promise<boolean>;
};

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout(opts?: {
  onSuccess?: () => void;
  onFailure?: (msg: string) => void;
}): UseRazorpayCheckoutReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolveRef = useRef<((val: boolean) => void) | null>(null);

  const startCheckout = useCallback(
    async (items: CheckoutItem[]): Promise<boolean> => {
      if (items.length === 0) return false;
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        if (res.status === 401) {
          setError("Please log in to checkout.");
          return false;
        }

        const data = await res.json();
        if (!res.ok) {
          const msg = data.error ?? "Order creation failed";
          setError(msg);
          opts?.onFailure?.(msg);
          return false;
        }

        const scriptLoaded = await loadScript();
        if (!scriptLoaded) {
          const msg = "Payment system could not load. Please try again.";
          setError(msg);
          opts?.onFailure?.(msg);
          return false;
        }

        return new Promise<boolean>((resolve) => {
          resolveRef.current = resolve;

          const options: Record<string, unknown> = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency ?? "INR",
            name: "Anand Ras",
            description: "Luxury Attar Order",
            order_id: data.razorpayOrderId,
            handler: async (response: CheckoutResult) => {
              try {
                const verifyRes = await fetch("/api/orders/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                });

                if (verifyRes.ok) {
                  opts?.onSuccess?.();
                  resolveRef.current?.(true);
                } else {
                  const msg = "Payment verification failed. Contact support if charged.";
                  setError(msg);
                  opts?.onFailure?.(msg);
                  resolveRef.current?.(false);
                }
              } catch {
                const msg = "Verification error. Your payment is safe — check your orders.";
                setError(msg);
                opts?.onFailure?.(msg);
                resolveRef.current?.(false);
              }
            },
            prefill: {},
            theme: { color: "#1e2023" },
          };

          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", () => {
            const msg = "Payment failed. Please try again.";
            setError(msg);
            opts?.onFailure?.(msg);
            resolveRef.current?.(false);
          });
          rzp.open();
        });
      } catch {
        const msg = "Something went wrong. Please try again.";
        setError(msg);
        opts?.onFailure?.(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [opts],
  );

  return { loading, error, startCheckout };
}
