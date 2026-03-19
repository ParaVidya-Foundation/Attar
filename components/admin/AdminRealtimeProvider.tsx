"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

const ADMIN_SUBSCRIPTIONS = [
  { table: "orders", event: "*" as const },
  { table: "order_items", event: "INSERT" as const },
  { table: "product_variants", event: "UPDATE" as const },
  { table: "products", event: "*" as const },
];

export function AdminRealtimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleMessage = useCallback(() => {
    router.refresh();
  }, [router]);

  useAdminRealtime({
    subscriptions: ADMIN_SUBSCRIPTIONS,
    onMessage: handleMessage,
  });

  return <>{children}</>;
}
