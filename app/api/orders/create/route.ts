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
const MIN_ORDER_PAISE = 100; // ₹1 minimum
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeVariantId(raw: unknown): string {
  if (raw == null || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  const withoutLeadingEquals = trimmed.startsWith("=") ? trimmed.slice(1).trim() : trimmed;
  return withoutLeadingEquals;
}

const guestSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(INDIA_PHONE, "Valid 10-digit Indian phone number required"),
  variant_id: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  address_line1: z.string().max(200).optional(),
  address_line2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
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

  const rawVariantId = parsed.data.variant_id;
  const variant_id = sanitizeVariantId(rawVariantId);
  if (!variant_id || !UUID_REGEX.test(variant_id)) {
    return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
  }

  const { name, email, phone, quantity, address_line1, address_line2, city, state, pincode, country } = parsed.data;

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

    // 1. Variant must exist (product_variants has no is_active; product drives visibility)
    const { data: variant, error: variantErr } = await admin
      .from("product_variants")
      .select("id, product_id, price, stock")
      .eq("id", variant_id)
      .single();

    if (variantErr || !variant) {
      serverWarn("orders/create", "Variant not found: " + variant_id);
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    const pricePaise = variant.price;
    if (typeof pricePaise !== "number" || pricePaise < 0) {
      serverWarn("orders/create", "Invalid variant price: " + variant_id);
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    // 2. Product must exist and be active
    const { data: product, error: productErr } = await admin
      .from("products")
      .select("id, name, is_active")
      .eq("id", variant.product_id)
      .single();

    if (productErr || !product || !product.is_active) {
      serverWarn("orders/create", "Product unavailable: " + variant.product_id);
      return NextResponse.json({ error: "Product unavailable" }, { status: 400 });
    }

    // 3. Amount from DB only; must be > 0 and >= 100 paise (never call Razorpay before this)
    const totalPaise = pricePaise * quantity;
    if (totalPaise <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }
    if (totalPaise < MIN_ORDER_PAISE) {
      return NextResponse.json({ error: "Minimum order amount ₹1" }, { status: 400 });
    }

    serverWarn(
      "ORDER CREATE",
      `variant_id=${variant_id} quantity=${quantity} amount=${totalPaise} user_email=${email ?? "guest"}`,
    );

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
        address_line1: address_line1 ?? null,
        address_line2: address_line2 ?? null,
        city: city ?? null,
        state: state ?? null,
        pincode: pincode ?? null,
        country: country ?? null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      serverWarn("orders/create", "Order insert failed: " + (orderErr?.message ?? "no order"));
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const { error: itemsErr } = await admin.from("order_items").insert({
      order_id: order.id,
      product_id: variant.product_id,
      variant_id: variant.id,
      quantity,
      price: pricePaise,
    });

    if (itemsErr) {
      serverWarn("orders/create", "Order items insert failed: " + (itemsErr?.message ?? "unknown"));
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
  } catch (err) {
    serverWarn("orders/create", err instanceof Error ? err.message : "Order create exception");
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
