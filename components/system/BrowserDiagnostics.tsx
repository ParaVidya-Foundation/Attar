"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";
import { getClientEnv, getSupabaseAuthStorageKey, hasClientEnv, MissingEnvError } from "@/lib/env";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

declare global {
  interface Window {
    debugStore?: () => Promise<void>;
  }
}

async function runBrowserDiagnostics() {
  if (!hasClientEnv()) {
    // eslint-disable-next-line no-console
    console.warn("[browser diagnostics] skipped — client env not configured");
    return;
  }

  const clientEnv = getClientEnv();
  const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const storageKey = getSupabaseAuthStorageKey();
  const tokenKeys =
    typeof window === "undefined"
      ? []
      : Object.keys(window.localStorage).filter((key) => key.includes("auth-token") || key === storageKey);

  const result = {
    env: {
      supabaseUrlPresent: Boolean(supabaseUrl),
      anonKeyPresent: Boolean(anonKey),
      siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL ?? null,
      storageKey,
    },
    supabase: {
      restReachable: false,
      productsReturned: 0,
      error: null as string | null,
    },
    auth: {
      sessionPresent: false,
      userId: null as string | null,
      tokenKeys,
    },
    razorpay: {
      globalPresent: typeof window !== "undefined" && typeof window.Razorpay === "function",
      scriptPresent:
        typeof document !== "undefined" &&
        Boolean(document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')),
    },
  };

  try {
    const supabase = createBrowserClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    result.auth.sessionPresent = Boolean(session);
    result.auth.userId = session?.user?.id ?? null;
    if (sessionError) {
      result.supabase.error = sessionError.message;
    }

    const restResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    result.supabase.restReachable = restResponse.ok;
    if (restResponse.ok) {
      const rows = (await restResponse.json()) as Array<{ id: string }>;
      result.supabase.productsReturned = rows.length;
    } else {
      result.supabase.error = `REST ${restResponse.status}`;
    }
  } catch (error) {
    if (error instanceof MissingEnvError) {
      // eslint-disable-next-line no-console
      console.warn("[browser diagnostics] env missing, skipping supabase checks", error.message);
      return;
    }
    result.supabase.error = error instanceof Error ? error.message : "Unknown diagnostics error";
  }

  // eslint-disable-next-line no-console
  console.group("[debugStore]");
  // eslint-disable-next-line no-console
  console.log("Supabase connection", result.supabase);
  // eslint-disable-next-line no-console
  console.log("Auth session", result.auth);
  // eslint-disable-next-line no-console
  console.log("Razorpay status", result.razorpay);
  // eslint-disable-next-line no-console
  console.log("Env", result.env);
  // eslint-disable-next-line no-console
  console.groupEnd();
}

export function BrowserDiagnostics() {
  useEffect(() => {
    if (!hasClientEnv()) {
      // eslint-disable-next-line no-console
      console.warn("[browser diagnostics] disabled — NEXT_PUBLIC_SUPABASE_* not set");
      return;
    }

    window.debugStore = runBrowserDiagnostics;

    let unsubscribed = false;

    try {
      const supabase = createBrowserClient();
      supabase.auth
        .getSession()
        .then(({ data, error }: { data: { session: Session | null }; error: Error | null }) => {
          if (unsubscribed) return;
          if (error) {
            // eslint-disable-next-line no-console
            console.error("[auth] getSession failed", error.message);
            return;
          }
          // eslint-disable-next-line no-console
          console.info("[auth] session bootstrap", {
            hasSession: Boolean(data.session),
            storageKey: getSupabaseAuthStorageKey(),
          });
        })
        .catch((error: unknown) => {
          if (unsubscribed) return;
          // eslint-disable-next-line no-console
          console.error("[auth] session bootstrap error", error);
        });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        // eslint-disable-next-line no-console
        console.info("[auth] state change", {
          event,
          hasSession: Boolean(session),
          storageKey: getSupabaseAuthStorageKey(),
        });
      });

      return () => {
        unsubscribed = true;
        subscription.unsubscribe();
        delete window.debugStore;
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[browser diagnostics] init failed", error);
      return () => {
        delete window.debugStore;
      };
    }
  }, []);

  return null;
}
