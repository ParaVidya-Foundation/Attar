/**
 * POST /api/orders/verify — Verify Razorpay payment signature (client callback)
 * This is the client-side verification path (webhook is the authoritative path).
 */
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { z } from "zod";
import { NextResponse } from "next/server";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });
}
