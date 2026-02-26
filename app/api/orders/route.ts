/**
 * POST /api/orders — Create order and return Razorpay checkout info (cart flow).
 * Supports authenticated and guest checkout. Validates cart server-side; never trusts client prices.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { getServerEnv } from "@/lib/env";
import { serverError } from "@/lib/security/logger";
import { z } from "zod";
import { NextResponse } from "next/server";

const INDIA_PHONE = /^[6-9]\d{9}$/;

const cartItemSchema = z.object({
  variant_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
});

const guestCartSchema = cartSchema.and(
  z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(INDIA_PHONE, "Valid 10-digit Indian phone number required"),
    address_line1: z.string().min(1).max(200),
    address_line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    pincode: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
  }),
);

export async function POST(req: Request) {
  let body: unknown;
  try {
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isGuest = !user;
    const parsed = isGuest ? guestCartSchema.safeParse(body) : cartSchema.safeParse(body);

    if (!parsed.success) {
      if (isGuest) {
        return NextResponse.json(
          {
            error:
              "Guest checkout requires customer and shipping details. Log in or use the checkout page.",
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Invalid cart payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const items = parsed.data.items;

    const resolved: Array<{
      product_id: string;
      variant_id: string;
      quantity: number;
      price: number;
    }> = [];
    let totalPaise = 0;

    for (const item of items) {
      const { data: variant } = await admin
        .from("product_variants")
        .select("id, product_id, price")
        .eq("id", item.variant_id)
        .single();

      if (!variant) {
        return NextResponse.json(
          { error: `Variant not found: ${item.variant_id}` },
          { status: 400 },
        );
      }

      const { data: product } = await admin
        .from("products")
        .select("id, is_active")
        .eq("id", variant.product_id)
        .single();
      if (!product?.is_active) {
        return NextResponse.json(
          { error: `Product not available: ${item.variant_id}` },
          { status: 400 },
        );
      }

      // Inventory not enforced (unlimited mode)
      const lineTotal = variant.price * item.quantity;
      resolved.push({
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity: item.quantity,
        price: variant.price,
      });
      totalPaise += lineTotal;
    }

    if (resolved.length === 0) {
      return NextResponse.json({ error: "No valid cart items" }, { status: 400 });
    }

    if (totalPaise <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 },
      );
    }

    const orderPayload = {
      user_id: user?.id ?? null,
      email: isGuest ? (parsed.data as z.infer<typeof guestCartSchema>).email : (user?.email ?? ""),
      name: isGuest ? (parsed.data as z.infer<typeof guestCartSchema>).name : null,
      phone: isGuest ? (parsed.data as z.infer<typeof guestCartSchema>).phone : null,
      status: "pending",
      amount: totalPaise,
      currency: "INR",
      razorpay_order_id: null,
    };

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (orderErr || !order) {
      serverError("orders cart insert order", orderErr ?? "order missing");
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const orderItems = resolved.map((r) => ({
      order_id: order.id,
      product_id: r.product_id,
      variant_id: r.variant_id,
      quantity: r.quantity,
      price: r.price,
    }));

    const { error: itemsErr } = await admin.from("order_items").insert(orderItems);
    if (itemsErr) {
      serverError("orders cart insert order_items", itemsErr);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const receipt = `ord_${Date.now()}`;
    let razorpayOrderId: string;
    let razorpayAmount: number;
    let razorpayCurrency: string;
    try {
      const razorpayOrder = await createRazorpayOrder({
        amount: totalPaise,
        currency: "INR",
        receipt,
      });
      razorpayOrderId = razorpayOrder.id;
      razorpayAmount = Number(razorpayOrder.amount);
      razorpayCurrency = razorpayOrder.currency;
    } catch (error) {
      serverError("orders cart razorpay", error);
      await admin
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      return NextResponse.json({ error: "Payment gateway error" }, { status: 500 });
    }

    const { error: orderUpdateErr } = await admin
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("status", "pending");
    if (orderUpdateErr) {
      serverError("orders cart update razorpay_order_id", orderUpdateErr);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const env = getServerEnv();
    const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      serverError("orders cart env", "Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId,
      amount: razorpayAmount,
      currency: razorpayCurrency,
      keyId,
    });
  } catch (error) {
    serverError("orders cart", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 },
    );
  }
}
