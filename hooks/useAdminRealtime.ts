"use client";

import { useEffect, useRef, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableEvent = "INSERT" | "UPDATE" | "DELETE";

type SubscriptionConfig = {
  table: string;
  event?: TableEvent | "*";
  filter?: string;
};

type UseAdminRealtimeOptions = {
  subscriptions: SubscriptionConfig[];
  onMessage: (payload: { table: string; eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void;
  enabled?: boolean;
};

export function useAdminRealtime({ subscriptions, onMessage, enabled = true }: UseAdminRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled || subscriptions.length === 0) return;

    let supabase: ReturnType<typeof createBrowserClient>;
    try {
      supabase = createBrowserClient();
    } catch {
      return;
    }

    const channel = supabase.channel("admin-realtime", {
      config: { broadcast: { self: true } },
    });

    for (const sub of subscriptions) {
      const event = sub.event ?? "*";
      const opts: Record<string, string> = {
        event,
        schema: "public",
        table: sub.table,
      };
      if (sub.filter) {
        opts.filter = sub.filter;
      }

      channel.on(
        "postgres_changes" as "system",
        opts as unknown as { event: "system" },
        (payload: unknown) => {
          const p = payload as {
            eventType: string;
            new: Record<string, unknown>;
            old: Record<string, unknown>;
          };
          onMessageRef.current({
            table: sub.table,
            eventType: p.eventType,
            new: p.new ?? {},
            old: p.old ?? {},
          });
        },
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [enabled, subscriptions.length]);

  return channelRef;
}

export function useOrdersRealtime(onUpdate: () => void) {
  const stableOnUpdate = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  return useAdminRealtime({
    subscriptions: [
      { table: "orders", event: "*" },
      { table: "order_items", event: "INSERT" },
    ],
    onMessage: stableOnUpdate,
  });
}

export function useInventoryRealtime(onUpdate: () => void) {
  return useAdminRealtime({
    subscriptions: [{ table: "product_variants", event: "UPDATE" }],
    onMessage: onUpdate,
  });
}
