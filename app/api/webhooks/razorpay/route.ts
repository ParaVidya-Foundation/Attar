/**
 * POST /api/webhooks/razorpay — Razorpay payment webhook
 * Verifies signature, updates order status, inserts payment record, decrements inventory.
 * This is the AUTHORITATIVE path — never trust the client-side payment result.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { recordWebhookReceived } from "@/app/api/health/route";
import crypto from "crypto";

function extractPaymentEntity(payload: Record<string, unknown>) {
  const paymentEntity = (payload.payload as Record<string, unknown>)?.payment as
    | Record<string, unknown>
    | undefined;
  return paymentEntity?.entity as Record<string, unknown> | undefined;
}

function extractOrderEntity(payload: Record<string, unknown>) {
  const orderEntity = (payload.payload as Record<string, unknown>)?.order as
    | Record<string, unknown>
    | undefined;
  return orderEntity?.entity as Record<string, unknown> | undefined;
}

async function markOrderPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  amount: number,
  currency: string,
) {
  const admin = createAdminClient();

  // IDEMPOTENCY CHECK: If payment already exists, return success immediately
  const { data: existingPayment } = await admin
    .from("payments")
    .select("id")
    .eq("razorpay_payment_id", razorpayPaymentId)
    .single();

  if (existingPayment) {
    console.info("[webhook] Payment already processed (idempotent):", razorpayPaymentId);
    return { ok: true, alreadyProcessed: true };
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, status, razorpay_payment_id")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (orderErr || !order) {
    console.error("[webhook] Order not found for razorpay_order_id:", razorpayOrderId);
    return { ok: false, status: 404 };
  }

  // Additional idempotency check: if order already has this payment_id
  if (order.razorpay_payment_id === razorpayPaymentId && order.status === "paid") {
    console.info("[webhook] Order already marked as paid with this payment:", razorpayPaymentId);
    return { ok: true, alreadyProcessed: true };
  }

  // If order is already paid with different payment_id, log warning but return success
  if (order.status === "paid" && order.razorpay_payment_id !== razorpayPaymentId) {
    console.warn(
      "[webhook] Order already paid with different payment_id:",
      order.razorpay_payment_id,
      "new:",
      razorpayPaymentId,
    );
    return { ok: true, alreadyProcessed: true };
  }

  // Update order status atomically
  const { error: updateErr } = await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", order.status); // Optimistic locking: only update if status hasn't changed

  if (updateErr) {
    console.error("[webhook] Order status update failed:", updateErr);
    return { ok: false, status: 500 };
  }

  // Insert payment record (with idempotency protection via UNIQUE constraint)
  const { error: paymentErr } = await admin.from("payments").insert({
    order_id: order.id,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
    status: "captured",
    amount: Math.round(amount / 100),
    currency,
    method: "razorpay",
  });

  if (paymentErr) {
    // If payment insert fails due to duplicate, that's okay (idempotent)
    if (paymentErr.code === "23505") {
      console.info("[webhook] Payment record already exists (idempotent):", razorpayPaymentId);
    } else {
      console.error("[webhook] Payment insert failed:", paymentErr);
      // Don't fail the webhook - order is already updated
    }
  }

  // Decrement inventory
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
          "[webhook] Inventory decrement failed:",
          item.product_id,
          item.size_ml,
          invErr,
        );
        // Log but don't fail - inventory can be manually adjusted
      }
    }
  }

  console.info("[webhook] Order marked as paid successfully:", {
    orderId: order.id,
    razorpayOrderId,
    razorpayPaymentId,
    amount,
  });

  return { ok: true };
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    console.warn("[webhook] Missing x-razorpay-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const rawBody = await req.text();

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  if (expected !== signature) {
    console.warn("[webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Record webhook received for health monitoring
  recordWebhookReceived();

  const event = payload.event as string | undefined;
  const webhookId = (payload as { id?: string }).id;
  
  console.info("[WEBHOOK RECEIVED]", {
    event,
    webhookId,
    timestamp: new Date().toISOString(),
  });

  // ── payment.captured ──────────────────────────────────────────────
  if (event === "payment.captured") {
    const entity = extractPaymentEntity(payload);
    if (!entity) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const razorpayPaymentId = entity.id as string;
    const razorpayOrderId = entity.order_id as string;
    const amount = entity.amount as number;
    const currency = (entity.currency as string) ?? "INR";

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Missing order_id or payment_id" }, { status: 400 });
    }

    console.info("[WEBHOOK PAYMENT CAPTURED]", {
      razorpayOrderId,
      razorpayPaymentId,
      amount,
      currency,
      webhookId,
    });

    const result = await markOrderPaid(razorpayOrderId, razorpayPaymentId, amount, currency);

    if (result.alreadyProcessed) {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }
    if (!result.ok) {
      return NextResponse.json(
        { error: "Processing failed" },
        { status: result.status ?? 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  // ── order.paid ────────────────────────────────────────────────────
  if (event === "order.paid") {
    const orderEntity = extractOrderEntity(payload);
    if (!orderEntity) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const razorpayOrderId = orderEntity.id as string;
    const amount = orderEntity.amount_paid as number;
    const currency = (orderEntity.currency as string) ?? "INR";

    const payments = (orderEntity.payments as Record<string, unknown>)?.items as
      | Array<Record<string, unknown>>
      | undefined;
    const razorpayPaymentId = (payments?.[0]?.id as string) ?? "";

    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    console.info("[WEBHOOK ORDER PAID]", {
      razorpayOrderId,
      razorpayPaymentId,
      amount,
      currency,
      webhookId,
    });

    const result = await markOrderPaid(razorpayOrderId, razorpayPaymentId, amount, currency);

    if (result.alreadyProcessed) {
      return NextResponse.json({ ok: true, message: "Already processed" });
    }
    if (!result.ok) {
      return NextResponse.json(
        { error: "Processing failed" },
        { status: result.status ?? 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  // ── payment.failed ────────────────────────────────────────────────
  if (event === "payment.failed") {
    const entity = extractPaymentEntity(payload);
    const razorpayOrderId = entity?.order_id as string | undefined;

    console.info("[WEBHOOK PAYMENT FAILED]", {
      razorpayOrderId,
      webhookId,
    });

    if (razorpayOrderId) {
      const admin = createAdminClient();
      await admin
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("razorpay_order_id", razorpayOrderId);
    }

    return NextResponse.json({ ok: true });
  }

  // ── unhandled event ───────────────────────────────────────────────
  console.warn("[WEBHOOK UNHANDLED EVENT]", {
    event,
    webhookId,
    payload: JSON.stringify(payload).slice(0, 500), // Log first 500 chars
  });
  return NextResponse.json({ ok: true, message: "Event ignored" });
}
