/**
 * POST /api/orders/verify — Verify Razorpay payment signature (client callback).
 * Supports both guest and authenticated orders.
 * This is the client-side path; the webhook is the authoritative source of truth.
 */
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverWarn } from "@/lib/security/logger";
import { z } from "zod";
import { NextResponse } from "next/server";

const ENDPOINT = "/api/orders/verify";
const ALLOW_HEADER = "GET, POST, OPTIONS";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  orderId: z.string().uuid().optional(),
});

export async function GET() {
  return NextResponse.json(
    { status: "ok", endpoint: ENDPOINT, method: "POST required" },
    { status: 200, headers: { Allow: ALLOW_HEADER } },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: ALLOW_HEADER } });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: { Allow: ALLOW_HEADER } });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    serverWarn("orders/verify", "Invalid payload received");
    return NextResponse.json({ error: "Invalid payload" }, { status: 400, headers: { Allow: ALLOW_HEADER } });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    serverWarn(
      "orders/verify",
      `Signature verification failed: razorpayOrderId=${razorpay_order_id} razorpayPaymentId=${razorpay_payment_id}`,
    );
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400, headers: { Allow: ALLOW_HEADER } });
  }

  // Look up the internal order id from razorpay_order_id if not provided
  let internalOrderId = orderId;
  if (!internalOrderId) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpay_order_id)
        .single();
      internalOrderId = data?.id;
    } catch {
      internalOrderId = undefined;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      orderId: internalOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    },
    { status: 200, headers: { Allow: ALLOW_HEADER } },
  );
}
