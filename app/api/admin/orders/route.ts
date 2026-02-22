/**
 * GET /api/admin/orders — Admin API for order management
 * Returns orders with filters, pagination, and statistics
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

export async function GET(req: Request) {
  const identifier = getClientIdentifier(req);
  const limit = await rateLimit(identifier, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    assertAdminEnv();
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const status = searchParams.get("status") ?? "all";
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = (page - 1) * limit;

    const admin = createAdminClient();

    // Build query
    let query = admin
      .from("orders")
      .select(
        "id,user_id,name,email,phone,status,amount,currency,razorpay_order_id,razorpay_payment_id,created_at,updated_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      serverError("admin orders API", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    // Get statistics
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
        .eq("status", "paid")
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

    const ordersToday = ordersTodayRes.count ?? 0;
    const revenueToday = (revenueTodayRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0);
    const pendingOrders = pendingRes.count ?? 0;
    const failedOrders = failedRes.count ?? 0;

    return NextResponse.json({
      orders: orders ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
      stats: {
        ordersToday,
        revenueToday,
        pendingOrders,
        failedOrders,
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
