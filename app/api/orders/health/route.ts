import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/payments/razorpay";
import { serverWarn } from "@/lib/security/logger";

type HealthStatus = {
  env_ok: boolean;
  razorpay_ok: boolean;
  db_ok: boolean;
  diagnostics: {
    missing_env: string[];
    razorpay_error?: string;
    db_error?: string;
  };
};

const REQUIRED_ENV = [
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function listMissingEnv(): string[] {
  return REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
}

export async function GET() {
  const status: HealthStatus = {
    env_ok: false,
    razorpay_ok: false,
    db_ok: false,
    diagnostics: {
      missing_env: listMissingEnv(),
    },
  };

  try {
    getServerEnv();
    status.env_ok = status.diagnostics.missing_env.length === 0;
  } catch (error) {
    status.env_ok = false;
    status.diagnostics.missing_env = Array.from(new Set([...status.diagnostics.missing_env, "server_env_validation"]));
    status.diagnostics.razorpay_error = error instanceof Error ? error.message : "Server env validation failed";
  }

  try {
    const razorpay = getRazorpayClient();
    await razorpay.orders.all({ count: 1 });
    status.razorpay_ok = true;
  } catch (error) {
    status.razorpay_ok = false;
    const message = error instanceof Error ? error.message : "Razorpay connectivity failed";
    status.diagnostics.razorpay_error = message;
    serverWarn("orders/health", `Razorpay check failed: ${message}`);
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("products").select("id").limit(1);
    if (error) {
      throw error;
    }
    status.db_ok = true;
  } catch (error) {
    status.db_ok = false;
    const message = error instanceof Error ? error.message : "DB connectivity failed";
    status.diagnostics.db_error = message;
    serverWarn("orders/health", `DB check failed: ${message}`);
  }

  const httpStatus = status.env_ok && status.razorpay_ok && status.db_ok ? 200 : 503;
  return NextResponse.json(status, { status: httpStatus });
}
