/**
 * POST /api/admin/expire-orders — Expire pending orders older than 30 minutes
 * Can be called manually or via cron job
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { NextResponse } from "next/server";

function adminErrorStatus(err: unknown): { status: number; body: { error: string } } {
  if (err instanceof NotAuthenticatedError) {
    return { status: 401, body: { error: "Not authenticated" } };
  }
  if (err instanceof ForbiddenError || err instanceof ProfileMissingError) {
    return { status: 403, body: { error: "Forbidden" } };
  }
  return { status: 500, body: { error: "Internal server error" } };
}

export async function POST() {
  try {
    assertAdminEnv();
    await assertAdmin();
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
    if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError || err instanceof ProfileMissingError) {
      const { status, body } = adminErrorStatus(err);
      return NextResponse.json(body, { status });
    }
    console.error("[EXPIRE ORDERS ERROR]", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
