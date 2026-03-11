"use client";

import { useEffect } from "react";

export function ProductEventTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const payload = JSON.stringify({
      productId,
      eventType: "view_product",
    });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [productId]);

  return null;
}
