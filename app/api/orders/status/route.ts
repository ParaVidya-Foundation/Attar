/**
 * GET /api/orders/status — Check order status by orderId or razorpay_order_id
 * Used by client to poll order status after payment
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const razorpayOrderId = searchParams.get("razorpayOrderId");

  if (!orderId && !razorpayOrderId) {
    return NextResponse.json({ error: "orderId or razorpayOrderId required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    let query = admin.from("orders").select("id, status, razorpay_order_id, razorpay_payment_id, created_at");

    if (orderId) {
      query = query.eq("id", orderId);
    } else if (razorpayOrderId) {
      query = query.eq("razorpay_order_id", razorpayOrderId);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      razorpayOrderId: order.razorpay_order_id,
      razorpayPaymentId: order.razorpay_payment_id,
      createdAt: order.created_at,
    });
  } catch (err) {
    console.error("[ORDER STATUS CHECK ERROR]", {
      error: err instanceof Error ? err.message : String(err),
      orderId,
      razorpayOrderId,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
