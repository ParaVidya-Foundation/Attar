/**
 * POST /api/orders/create — Guest + authenticated order creation.
 * Validates input, looks up prices from DB (never trusts client), creates Razorpay order.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { getServerEnv } from "@/lib/env";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import type { OrderPayload } from "@/types/cart";
import { z } from "zod";
import { NextResponse } from "next/server";

const INDIA_PHONE = /^[6-9]\d{9}$/;

const guestSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(INDIA_PHONE, "Valid 10-digit Indian phone number required"),
  productId: z.string().uuid(),
  qty: z.number().int().min(1).max(99).default(1),
});

export async function POST(req: Request) {
  // Rate limiting: 5 order attempts per minute per IP
  const identifier = getClientIdentifier(req);
  const limit = rateLimit(identifier, 5, 60 * 1000);

  if (!limit.allowed) {
    console.warn("[RATE LIMIT EXCEEDED]", { identifier });
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

  const parsed = guestSchema.safeParse(body as OrderPayload);
  if (!parsed.success) {
    console.warn("[ORDER CREATE] Validation failed", {
      issues: parsed.error.flatten(),
    });
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, phone, productId, qty } = parsed.data;

  // Optional: attach user_id if logged in
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Guest checkout — no user is fine
  }

  try {
    const admin = createAdminClient();

    const { data: product } = await admin
      .from("products")
      .select("id, name, price, is_active")
      .eq("id", productId)
      .single();

    if (!product || !product.is_active) {
      console.warn("[orders/create] Product not found or inactive:", productId);
      return NextResponse.json({ error: "Product not found or unavailable" }, { status: 400 });
    }

    // INVENTORY CHECK: Verify stock availability before creating order
    const { data: inventory } = await admin
      .from("inventory")
      .select("stock")
      .eq("product_id", productId)
      .eq("size_ml", 3) // Default size for guest checkout
      .single();

    const availableStock = inventory?.stock ?? 0;
    if (availableStock < qty) {
      console.warn("[orders/create] Insufficient inventory:", {
        productId,
        requested: qty,
        available: availableStock,
      });
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      );
    }

    const unitPrice: number = product.price;
    const total = unitPrice * qty;

    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    console.info("[ORDER CREATED]", {
      productId,
      qty,
      total,
      email: email.trim().toLowerCase(),
      userId: userId || "guest",
    });

    const receipt = `ord_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({
      amount: total * 100,
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
        total_amount: total,
        currency: "INR",
        razorpay_order_id: razorpayOrder.id,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("[ORDER CREATION FAILED]", {
        error: orderErr,
        productId,
        email: email.trim().toLowerCase(),
      });
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const { error: itemsErr } = await admin.from("order_items").insert({
      order_id: order.id,
      product_id: productId,
      size_ml: 3,
      qty,
      unit_price: unitPrice,
    });

    if (itemsErr) {
      console.error("[ORDER ITEMS INSERT FAILED]", {
        error: itemsErr,
        orderId: order.id,
      });
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    // Use safe env access
    const env = getServerEnv();
    const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      console.error("[orders/create] NEXT_PUBLIC_RAZORPAY_KEY_ID not configured");
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
  } catch (err) {
    console.error("[ORDER CREATION ERROR]", {
      error: err instanceof Error ? err.message : String(err),
      productId,
      email: email.trim().toLowerCase(),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
