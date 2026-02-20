/**
 * POST /api/admin/expire-orders — Expire pending orders older than 30 minutes
 * Can be called manually or via cron job
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const { createServerClient } = await import("@/lib/supabase/server");
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function POST() {
  try {
    await checkAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin.rpc("expire_pending_orders");

    if (error) {
      console.error("[EXPIRE ORDERS ERROR]", { error });
      return NextResponse.json({ error: "Failed to expire orders" }, { status: 500 });
    }

    const expiredCount = data ?? 0;

    console.info("[ORDERS EXPIRED]", {
      count: expiredCount,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Expired ${expiredCount} pending orders`,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[EXPIRE ORDERS ERROR]", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
