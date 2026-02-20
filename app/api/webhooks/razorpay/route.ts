/**
 * POST /api/webhooks/razorpay — Razorpay payment webhook
 * Verifies signature, updates order status, inserts payment record, decrements inventory.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const rawBody = await req.text();

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    console.warn("[webhook] Signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string | undefined;

  if (event === "payment.captured") {
    const paymentEntity = (payload.payload as Record<string, unknown>)?.payment as Record<
      string,
      unknown
    >;
    const entity = paymentEntity?.entity as Record<string, unknown> | undefined;

    if (!entity) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const razorpayPaymentId = entity.id as string;
    const razorpayOrderId = entity.order_id as string;
    const amount = entity.amount as number;
    const currency = (entity.currency as string) ?? "INR";
    const method = (entity.method as string) ?? "unknown";

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing order_id or payment_id" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", razorpayOrderId)
      .single();

    if (orderErr || !order) {
      console.error("[webhook] Order not found for razorpay_order_id:", razorpayOrderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }

    const { error: updateErr } = await admin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateErr) {
      console.error("[webhook] Order status update failed:", updateErr);
      return NextResponse.json({ error: "Order update failed" }, { status: 500 });
    }

    const { error: paymentErr } = await admin.from("payments").insert({
      order_id: order.id,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      status: "captured",
      amount: Math.round(amount / 100),
      currency,
    });

    if (paymentErr) {
      console.error("[webhook] Payment insert failed:", paymentErr);
    }

    const { data: orderItems } = await admin
      .from("order_items")
      .select("product_id, size_ml, qty")
      .eq("order_id", order.id);

    if (orderItems) {
      for (const item of orderItems) {
        const { error: invErr } = await admin.rpc("decrement_inventory", {
          p_product_id: item.product_id,
          p_size_ml: item.size_ml,
          p_qty: item.qty,
        });

        if (invErr) {
          console.error(
            "[webhook] Inventory decrement failed for",
            item.product_id,
            item.size_ml,
            ":",
            invErr,
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  }

  if (event === "payment.failed") {
    const paymentEntity = (payload.payload as Record<string, unknown>)?.payment as Record<
      string,
      unknown
    >;
    const entity = paymentEntity?.entity as Record<string, unknown> | undefined;
    const razorpayOrderId = entity?.order_id as string | undefined;

    if (razorpayOrderId) {
      const admin = createAdminClient();
      await admin
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("razorpay_order_id", razorpayOrderId);
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, message: "Event ignored" });
}
