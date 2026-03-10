/**
 * GET /api/health — production diagnostics endpoint.
 * Returns non-sensitive configuration status for fast incident triage.
 */
import { NextResponse } from "next/server";
import { getServerEnv, getSiteUrl } from "@/lib/env";
import { createStaticClient } from "@/lib/supabase/server";
import { validatePublicHttpsUrl } from "@/lib/payments/network-safety";

let lastWebhookTime: Date | null = null;

export function recordWebhookReceived() {
  lastWebhookTime = new Date();
}

export async function GET() {
  const env = getServerEnv();
  const siteUrl = getSiteUrl();

  const supabaseConfigured = !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const razorpayConfigured = !!(
    env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_SECRET &&
    env.RAZORPAY_WEBHOOK_SECRET
  );

  const siteUrlCheck = validatePublicHttpsUrl(siteUrl);
  const siteConfigured = !!siteUrl && (process.env.NODE_ENV !== "production" || siteUrlCheck.ok);

  let supabaseReachable = false;
  try {
    const supabase = createStaticClient();
    const { error } = await supabase.from("products").select("id").limit(1);
    supabaseReachable = !error;
  } catch {
    supabaseReachable = false;
  }

  const payload = {
    node_env: process.env.NODE_ENV ?? "development",
    supabase_configured: supabaseConfigured,
    supabase_reachable: supabaseReachable,
    razorpay_configured: razorpayConfigured,
    site_url_configured: siteConfigured,
    site_url: siteUrl || null,
    site_url_valid_public_https: siteUrlCheck.ok,
    site_url_reason: siteUrlCheck.ok ? null : siteUrlCheck.reason ?? "invalid",
    razorpay_mode:
      env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_live_")
        ? "live"
        : env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_test_")
          ? "test"
          : "unknown",
    webhook_last_received_at: lastWebhookTime ? lastWebhookTime.toISOString() : null,
  };

  const healthy = supabaseConfigured && razorpayConfigured && siteConfigured;
  return NextResponse.json(payload, { status: healthy ? 200 : 503 });
}
