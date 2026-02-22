/**
 * POST /api/admin/expire-orders — Expire pending orders older than 30 minutes
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { serverError } from "@/lib/security/logger";
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

export async function POST(req: Request) {
  const identifier = getClientIdentifier(req);
  const limit = await rateLimit(identifier, 20, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    assertAdminEnv();
    await assertAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin.rpc("expire_pending_orders");

    if (error) {
      serverError("expire-orders", error);
      return NextResponse.json({ error: "Failed to expire orders" }, { status: 500 });
    }

    const expiredCount = data ?? 0;
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
    serverError("expire-orders", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
