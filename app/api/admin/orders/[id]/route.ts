/**
 * GET /api/admin/orders/[id] — Get single order details for admin
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const identifier = getClientIdentifier(req);
  const limit = rateLimit(identifier, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    assertAdminEnv();
    await assertAdmin();
    const { id } = await params;

    const admin = createAdminClient();

    // Get order with customer details
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id,user_id,name,email,phone,status,amount,currency,razorpay_order_id,razorpay_payment_id,created_at,updated_at"
      )
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get order items
    const { data: items } = await admin
      .from("order_items")
      .select("product_id,variant_id,quantity,price")
      .eq("order_id", id);

    // Get product names
    const productIds = items?.map((i) => i.product_id) ?? [];
    const { data: products } = await admin
      .from("products")
      .select("id,name")
      .in("id", productIds);

    const productMap = new Map(products?.map((p) => [p.id, p.name]) ?? []);

    // Get customer email if user_id exists
    let customerEmail = order.email;
    if (order.user_id && !customerEmail) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", order.user_id)
        .single();
      customerEmail = profile?.email ?? null;
    }

    return NextResponse.json({
      order: {
        ...order,
        customerEmail,
      },
      items: items?.map((item) => ({
        ...item,
        productName: productMap.get(item.product_id) ?? "Unknown",
      })),
    });
  } catch (err) {
    if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError || err instanceof ProfileMissingError) {
      const { status, body } = adminErrorStatus(err);
      return NextResponse.json(body, { status });
    }
    serverError("admin order detail API", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
