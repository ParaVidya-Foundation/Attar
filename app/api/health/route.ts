/**
 * GET /api/health — Health check endpoint for Vercel monitoring.
 * Returns status of environment variables and Supabase connectivity.
 */
import { NextResponse } from "next/server";
import { getServerEnv, getClientEnv, hasClientEnv } from "@/lib/env";
import { createStaticClient } from "@/lib/supabase/server";

export async function GET() {
  const health: {
    status: "ok" | "degraded" | "error";
    timestamp: string;
    env: {
      supabase: boolean;
      razorpay: boolean;
      allRequired: boolean;
    };
    supabase?: {
      connected: boolean;
      error?: string;
    };
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabase: false,
      razorpay: false,
      allRequired: false,
    },
  };

  try {
    // Check client env vars
    const clientEnv = getClientEnv();
    health.env.supabase = !!(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
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
    } catch (err) {
      // Server env might not be available in edge runtime
      console.warn("[health] Server env check failed:", err);
    }

    // Test Supabase connectivity
    try {
      const supabase = createStaticClient();
      if (supabase) {
        const { error } = await supabase.from("products").select("id").limit(1);
        health.supabase = {
          connected: !error,
          error: error?.message,
        };
        if (error) {
          health.status = "degraded";
        }
      } else {
        health.supabase = {
          connected: false,
          error: "Supabase client not initialized",
        };
        health.status = "degraded";
      }
    } catch (err) {
      health.supabase = {
        connected: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
      health.status = "degraded";
    }

    // Determine final status
    if (!health.env.allRequired) {
      health.status = "error";
    } else if (!health.supabase?.connected) {
      health.status = "degraded";
    }

    const statusCode = health.status === "error" ? 503 : health.status === "degraded" ? 200 : 200;

    return NextResponse.json(health, { status: statusCode });
  } catch (err) {
    health.status = "error";
    health.env.allRequired = false;
    health.supabase = {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };

    return NextResponse.json(health, { status: 503 });
  }
}
