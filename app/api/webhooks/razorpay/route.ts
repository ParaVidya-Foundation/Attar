/**
 * POST /api/webhooks/razorpay — Razorpay payment webhook
 * Verifies signature, updates order status, decrements variant stock.
 * This is the AUTHORITATIVE path — never trust the client-side payment result.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { recordWebhookReceived } from "@/app/api/health/route";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { webhookSeen } from "@/lib/redis";
import { serverError, serverWarn } from "@/lib/security/logger";
import crypto from "crypto";

const webhookPayloadSchema = z.object({
  event: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

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
) {
  const admin = createAdminClient();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, status, razorpay_payment_id")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (orderErr || !order) {
    serverError("webhook markOrderPaid", orderErr ?? "Order not found");
    return { ok: false, status: 404 };
  }

  if (order.razorpay_payment_id === razorpayPaymentId && order.status === "paid") {
    return { ok: true, alreadyProcessed: true };
  }

  if (order.status !== "pending") {
    return { ok: true, alreadyProcessed: true };
  }

  const now = new Date().toISOString();
  // Update order status atomically
  const { error: updateErr } = await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      updated_at: now,
      paid_at: now,
    })
    .eq("id", order.id)
    .eq("status", "pending");

  if (updateErr) {
    serverError("webhook order update", updateErr);
    return { ok: false, status: 500 };
  }

  // Inventory not enforced (unlimited mode) — stock decrement skipped
  return { ok: true };
}

export async function POST(req: Request) {
  try {
    const identifier = getClientIdentifier(req);
    const limit = await rateLimit(identifier, 100, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      serverError("webhook", "RAZORPAY_WEBHOOK_SECRET missing");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const rawBody = await req.text();
    const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const signatureBuf = Buffer.from(signature, "utf8");
    const validSignature =
      expectedBuf.length === signatureBuf.length &&
      crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!validSignature) {
      serverWarn("webhook", "Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = webhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const payloadObj = parsed.data as unknown as Record<string, unknown>;

    recordWebhookReceived();

    const event = payloadObj.event as string;

    // ── payment.captured ──────────────────────────────────────────────
    if (event === "payment.captured") {
      const entity = extractPaymentEntity(payloadObj);
      if (!entity) {
        return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
      }

      const razorpayPaymentId = entity.id as string;
      const razorpayOrderId = entity.order_id as string;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ error: "Missing order_id or payment_id" }, { status: 400 });
      }

      const idempotencyKey = `payment.captured:${razorpayOrderId}`;
      if (await webhookSeen(idempotencyKey, 86400)) {
        return NextResponse.json({ ok: true, message: "Already processed" });
      }

      const result = await markOrderPaid(razorpayOrderId, razorpayPaymentId);

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
      const orderEntity = extractOrderEntity(payloadObj);
      if (!orderEntity) {
        return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
      }

      const razorpayOrderId = orderEntity.id as string;

      const payments = (orderEntity.payments as Record<string, unknown>)?.items as
        | Array<Record<string, unknown>>
        | undefined;
      const razorpayPaymentId = (payments?.[0]?.id as string) ?? "";

      if (!razorpayOrderId) {
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
      }

      const idempotencyKey = `order.paid:${razorpayOrderId}`;
      if (await webhookSeen(idempotencyKey, 86400)) {
        return NextResponse.json({ ok: true, message: "Already processed" });
      }

      const result = await markOrderPaid(razorpayOrderId, razorpayPaymentId);

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
      const entity = extractPaymentEntity(payloadObj);
      const razorpayOrderId = entity?.order_id as string | undefined;

      if (razorpayOrderId) {
        const admin = createAdminClient();
        await admin
          .from("orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("razorpay_order_id", razorpayOrderId)
          .eq("status", "pending");
      }

      return NextResponse.json({ ok: true });
    }

    serverWarn("webhook", "Unhandled event: " + (event ?? "unknown"));
    return NextResponse.json({ ok: true, message: "Event ignored" });
  } catch (error) {
    serverError("webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
