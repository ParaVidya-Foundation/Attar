/**
 * POST /api/orders/create — Guest + authenticated order creation.
 * Validates input, looks up price/stock from product_variants (never trusts client), creates Razorpay order.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { getServerEnv } from "@/lib/env";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { serverWarn } from "@/lib/security/logger";
import { z } from "zod";
import { NextResponse } from "next/server";

const INDIA_PHONE = /^[6-9]\d{9}$/;

const guestSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(INDIA_PHONE, "Valid 10-digit Indian phone number required"),
  variant_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export async function POST(req: Request) {
  const identifier = getClientIdentifier(req);
  const limit = rateLimit(identifier, 5, 60 * 1000);

  if (!limit.allowed) {
    serverWarn("orders/create", "Rate limit exceeded");
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(limit.resetAt),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  if (b && typeof b === "object" && (b.variant_id == null || b.variant_id === "")) {
    return NextResponse.json({ error: "variant_id is required" }, { status: 400 });
  }

  const parsed = guestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, phone, variant_id, quantity } = parsed.data;

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Guest checkout
  }

  try {
    const admin = createAdminClient();

    const { data: variant } = await admin
      .from("product_variants")
      .select("id, product_id, price, stock")
      .eq("id", variant_id)
      .single();

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 400 });
    }

    const { data: product } = await admin
      .from("products")
      .select("id, name, is_active")
      .eq("id", variant.product_id)
      .single();

    if (!product || !product.is_active) {
      return NextResponse.json({ error: "Product not found or unavailable" }, { status: 400 });
    }

    const availableStock = variant.stock ?? 0;
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      );
    }

    const totalPaise = variant.price * quantity;
    if (totalPaise <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const receipt = `ord_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({
      amount: totalPaise,
      currency: "INR",
      receipt,
    });

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        name,
        email,
        phone,
        status: "pending",
        amount: totalPaise,
        currency: "INR",
        razorpay_order_id: razorpayOrder.id,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const { error: itemsErr } = await admin.from("order_items").insert({
      order_id: order.id,
      product_id: variant.product_id,
      variant_id: variant.id,
      quantity,
      price: variant.price,
    });

    if (itemsErr) {
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const env = getServerEnv();
    const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
