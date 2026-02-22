/**
 * GET /api/health — Health check endpoint for Vercel monitoring.
 * Returns status of environment variables, site URL, Supabase, and Razorpay.
 */
import { NextResponse } from "next/server";
import { getServerEnv, getClientEnv, getSiteUrl } from "@/lib/env";
import { createStaticClient } from "@/lib/supabase/server";

// Track last webhook received time
let lastWebhookTime: Date | null = null;

export function recordWebhookReceived() {
  lastWebhookTime = new Date();
}

export async function GET() {
  const health: {
    status: "ok" | "degraded" | "error";
    timestamp: string;
    environment: "production" | "development";
    env: {
      supabase: boolean;
      razorpay: boolean;
      allRequired: boolean;
    };
    supabase?: {
      connected: boolean;
      error?: string;
    };
    razorpay?: {
      keysPresent: boolean;
    };
    webhook?: {
      lastReceivedTime: string | null;
      status: "active" | "stale" | "never";
    };
  } & {
    siteUrl: string | null;
    supabaseEnv: boolean;
    anonEnv: boolean;
    razorpayEnv: boolean;
    activeProductCount?: number;
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    siteUrl: null,
    env: {
      supabase: false,
      razorpay: false,
      allRequired: false,
    },
    supabaseEnv: false,
    anonEnv: false,
    razorpayEnv: false,
  };

  try {
    // Site URL (production must have NEXT_PUBLIC_SITE_URL)
    try {
      health.siteUrl = getSiteUrl();
    } catch {
      health.siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? null;
    }

    // Simple env booleans for quick smoke tests
    const supabaseUrlPresent = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonPresent = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const razorpaySecretPresent = !!process.env.RAZORPAY_KEY_SECRET;

    health.supabaseEnv = supabaseUrlPresent;
    health.anonEnv = supabaseAnonPresent;
    health.razorpayEnv = razorpaySecretPresent;

    // Check client env vars with schema
    const clientEnv = getClientEnv();
    health.env.supabase =
      !!clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
      !!clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    health.env.razorpay = !!clientEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    health.env.allRequired = health.env.supabase && health.env.razorpay;

    // Check server env vars
    try {
      const serverEnv = getServerEnv();
      health.env.allRequired =
        health.env.allRequired &&
        !!(
          serverEnv.SUPABASE_SERVICE_ROLE_KEY &&
          serverEnv.RAZORPAY_KEY_SECRET &&
          serverEnv.RAZORPAY_WEBHOOK_SECRET
        );
    } catch {
      // Server env might not be available in edge runtime
    }

    // Test Supabase connectivity and active product count
    try {
      const supabase = createStaticClient();
      if (supabase) {
        const { error } = await supabase.from("products").select("id").limit(1);
        health.supabase = {
          connected: !error,
          error: error ? "Connection failed" : undefined,
        };
        if (error) {
          health.status = "degraded";
        } else {
          const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true);
          health.activeProductCount = count ?? 0;
        }
      } else {
        health.supabase = {
          connected: false,
          error: "Supabase client not initialized",
        };
        health.status = "degraded";
      }
    } catch {
      health.supabase = {
        connected: false,
        error: "Connection failed",
      };
      health.status = "degraded";
    }

    // Razorpay keys check (production should use live keys)
    health.razorpay = {
      keysPresent: !!(
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        process.env.RAZORPAY_WEBHOOK_SECRET
      ),
    };

    // Webhook status
    if (lastWebhookTime) {
      const minutesSinceLastWebhook = (Date.now() - lastWebhookTime.getTime()) / (1000 * 60);
      health.webhook = {
        lastReceivedTime: lastWebhookTime.toISOString(),
        status: minutesSinceLastWebhook < 60 ? "active" : "stale",
      };
    } else {
      health.webhook = {
        lastReceivedTime: null,
        status: "never",
      };
    }

    // Determine final status
    if (!health.env.allRequired) {
      health.status = "error";
    } else if (!health.supabase?.connected || !health.razorpay?.keysPresent) {
      health.status = "degraded";
    } else if (health.webhook?.status === "stale") {
      health.status = "degraded";
    }

    const statusCode = health.status === "error" ? 503 : health.status === "degraded" ? 200 : 200;

    return NextResponse.json(health, { status: statusCode });
  } catch {
    health.status = "error";
    health.env.allRequired = false;
    health.supabase = {
      connected: false,
      error: "Check failed",
    };

    return NextResponse.json(health, { status: 503 });
  }
}
