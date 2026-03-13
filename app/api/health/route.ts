/**
 * GET /api/health — production diagnostics endpoint.
 * Returns non-sensitive configuration status for fast incident triage.
 */
import { NextResponse } from "next/server";
import { getServerEnv, getSiteUrl, getEnvPresence } from "@/lib/env";
import { createStaticClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validatePublicHttpsUrl } from "@/lib/payments/network-safety";
import { serverError } from "@/lib/security/logger";

let lastWebhookTime: Date | null = null;

export function recordWebhookReceived() {
  lastWebhookTime = new Date();
}

export async function GET() {
  let env: ReturnType<typeof getServerEnv> | null = null;
  let envError: string | null = null;
  try {
    env = getServerEnv();
  } catch (err) {
    envError = err instanceof Error ? err.message : "Server env validation failed";
    serverError("health", err);
  }

  const envPresence = getEnvPresence();

  let siteUrl: string | null = null;
  try {
    siteUrl = getSiteUrl();
  } catch {
    siteUrl = null;
  }

  const supabaseConfigured = envPresence.NEXT_PUBLIC_SUPABASE_URL && envPresence.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const razorpayConfigured = envPresence.NEXT_PUBLIC_RAZORPAY_KEY_ID && envPresence.RAZORPAY_KEY_SECRET && envPresence.RAZORPAY_WEBHOOK_SECRET;

  const siteUrlCheck = validatePublicHttpsUrl(siteUrl);
  const siteConfigured = !!siteUrl && (process.env.NODE_ENV !== "production" || siteUrlCheck.ok);

  let supabaseReachable = false;
  let supabaseError: string | null = null;
  let supabaseProductCount: number | null = null;
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("products").select("id").limit(5);
    supabaseReachable = !error;
    supabaseProductCount = data?.length ?? 0;
    if (error) supabaseError = error.message;
  } catch (err) {
    supabaseReachable = false;
    supabaseError = err instanceof Error ? err.message : "Connection failed";
  }

  let adminReachable = false;
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("products").select("id").limit(1);
    adminReachable = !error;
  } catch {
    adminReachable = false;
  }

  const razorpayKeyId = env?.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

  const payload = {
    status: "ok",
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV ?? "development",
    env_configured: !envError,
    env_error: envError,
    env_presence: envPresence,
    supabase: {
      configured: supabaseConfigured,
      reachable: supabaseReachable,
      admin_reachable: adminReachable,
      product_count: supabaseProductCount,
      error: supabaseError,
      url_host: envPresence.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host
        : null,
    },
    razorpay: {
      configured: razorpayConfigured,
      mode: razorpayKeyId.startsWith("rzp_live_")
        ? "live"
        : razorpayKeyId.startsWith("rzp_test_")
          ? "test"
          : "unknown",
    },
    site: {
      url: siteUrl,
      configured: siteConfigured,
      valid_public_https: siteUrlCheck.ok,
      reason: siteUrlCheck.ok ? null : siteUrlCheck.reason ?? "invalid",
    },
    webhook_last_received_at: lastWebhookTime ? lastWebhookTime.toISOString() : null,
  };

  const healthy = supabaseConfigured && supabaseReachable && razorpayConfigured && siteConfigured && !envError;
  return NextResponse.json(payload, { status: healthy ? 200 : 503 });
}
