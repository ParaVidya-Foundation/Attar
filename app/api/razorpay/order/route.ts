import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { serverError, serverWarn } from "@/lib/security/logger";

const ENDPOINT = "/api/razorpay/order";
const ALLOW_HEADER = "GET, POST, OPTIONS";

const orderSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.literal("INR").optional().default("INR"),
  receipt: z.string().max(100).optional(),
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
  try {
    const identifier = getClientIdentifier(req);
    const limit = await rateLimit(identifier, 5, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            Allow: ALLOW_HEADER,
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: { Allow: ALLOW_HEADER } },
      );
    }

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: { Allow: ALLOW_HEADER } },
      );
    }

    const amountRupees = parsed.data.amount;
    const amountPaise = Math.round(amountRupees * 100);

    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
      return NextResponse.json(
        { error: "Minimum order amount is ₹1" },
        { status: 400, headers: { Allow: ALLOW_HEADER } },
      );
    }

    const env = getServerEnv();
    const receipt = parsed.data.receipt ?? `rzp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const order = await createRazorpayOrder({
      amount: amountPaise,
      currency: "INR",
      receipt,
    });

    serverWarn(ENDPOINT, `order created id=${order.id} amount=${order.amount} receipt=${receipt}`);

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      { status: 200, headers: { "Cache-Control": "no-store", Allow: ALLOW_HEADER } },
    );
  } catch (error) {
    serverError(ENDPOINT, error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500, headers: { Allow: ALLOW_HEADER } },
    );
  }
}
