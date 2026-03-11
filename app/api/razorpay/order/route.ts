import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { serverError, serverWarn } from "@/lib/security/logger";

const orderSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().optional(),
  receipt: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const env = getServerEnv();
    const order = await createRazorpayOrder(parsed.data);
    serverWarn("api/razorpay/order", `order created id=${order.id} amount=${order.amount}`);

    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    serverError("api/razorpay/order", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
