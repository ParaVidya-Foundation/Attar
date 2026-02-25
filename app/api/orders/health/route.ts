import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/payments/razorpay";

export async function GET() {
  const status = {
    env_ok: false,
    razorpay_ok: false,
    db_ok: false,
  };

  // Validate required env via envalid
  try {
    const env = getServerEnv();
    if (
      env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY &&
      env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_SECRET
    ) {
      status.env_ok = true;
    }
  } catch {
    status.env_ok = false;
  }

  // Check Razorpay client construction (env + SDK)
  try {
    getRazorpayClient();
    status.razorpay_ok = true;
  } catch {
    status.razorpay_ok = false;
  }

  // Simple DB connectivity check
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("products").select("id").limit(1);
    status.db_ok = !error;
  } catch {
    status.db_ok = false;
  }

  return NextResponse.json(status);
}

