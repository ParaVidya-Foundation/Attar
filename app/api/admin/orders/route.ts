/**
 * GET /api/admin/orders — Admin API for order management.
 * Returns orders with filters, pagination, and statistics.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { serverError } from "@/lib/security/logger";
import { PAID_STATUSES } from "@/lib/admin/services/types";
import { z } from "zod";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["all", "created", "pending", "paid", "shipped", "delivered", "failed", "cancelled", "expired"] as const;

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  status: z.enum(VALID_STATUSES).default("all"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function adminErrorStatus(err: unknown): { status: number; body: { error: string } } {
  if (err instanceof NotAuthenticatedError) {
    return { status: 401, body: { error: "Not authenticated" } };
  }
  if (err instanceof ForbiddenError || err instanceof ProfileMissingError) {
    return { status: 403, body: { error: "Forbidden" } };
  }
  return { status: 500, body: { error: "Internal server error" } };
}

export async function GET(req: Request) {
  const identifier = getClientIdentifier(req);
  const rl = await rateLimit(identifier, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    assertAdminEnv();
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { page, status, limit: pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;
    const admin = createAdminClient();

    let query = admin
      .from("orders")
      .select(
        "id,user_id,name,email,phone,status,amount,currency,razorpay_order_id,razorpay_payment_id,created_at,updated_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      serverError("admin orders API", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59.999`;

    const [ordersTodayRes, revenueTodayRes, pendingRes, failedRes] = await Promise.all([
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      admin
        .from("orders")
        .select("amount")
        .in("status", [...PAID_STATUSES])
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
    ]);

    return NextResponse.json({
      orders: orders ?? [],
      pagination: {
        page,
        limit: pageSize,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
      stats: {
        ordersToday: ordersTodayRes.count ?? 0,
        revenueToday: (revenueTodayRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0),
        pendingOrders: pendingRes.count ?? 0,
        failedOrders: failedRes.count ?? 0,
      },
    });
  } catch (err) {
    if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError || err instanceof ProfileMissingError) {
      const { status, body } = adminErrorStatus(err);
      return NextResponse.json(body, { status });
    }
    serverError("admin orders API", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
