"use client";

import Script from "next/script";

export function RazorpayScript() {
  return (
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="lazyOnload"
      onError={() => {
        // eslint-disable-next-line no-console
        console.error("[razorpay] Global checkout.js failed to load");
      }}
    />
  );
}
