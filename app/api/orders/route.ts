/**
 * POST /api/orders — Create order and return Razorpay checkout info (cart flow).
 * Supports authenticated and guest checkout. Validates cart server-side; never trusts client prices.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { getServerEnv } from "@/lib/env";
import { serverError, serverWarn } from "@/lib/security/logger";
import { z } from "zod";
import { NextResponse } from "next/server";

const ENDPOINT = "/api/orders";
const ALLOW_HEADER = "GET, POST, OPTIONS";
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
    let keyId: string;
    try {
      keyId = getServerEnv().NEXT_PUBLIC_RAZORPAY_KEY_ID;
    } catch (envErr) {
      serverError("orders cart env", envErr);
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
    }

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: { Allow: ALLOW_HEADER } });
    }

    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return NextResponse.json({ error: "Auth service not configured" }, { status: 500, headers: { Allow: ALLOW_HEADER } });
    }
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
          { status: 400, headers: { Allow: ALLOW_HEADER } },
        );
      }
      return NextResponse.json(
        { error: "Invalid cart payload", details: parsed.error.flatten() },
        { status: 400, headers: { Allow: ALLOW_HEADER } },
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
        return NextResponse.json({ error: `Variant not found: ${item.variant_id}` }, { status: 400, headers: { Allow: ALLOW_HEADER } });
      }

      const { data: product } = await admin
        .from("products")
        .select("id, is_active")
        .eq("id", variant.product_id)
        .single();
      if (!product?.is_active) {
        return NextResponse.json({ error: `Product not available: ${item.variant_id}` }, { status: 400, headers: { Allow: ALLOW_HEADER } });
      }

      if (typeof variant.price !== "number" || !Number.isInteger(variant.price) || variant.price <= 0) {
        return NextResponse.json({ error: `Invalid variant price: ${item.variant_id}` }, { status: 400, headers: { Allow: ALLOW_HEADER } });
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
      return NextResponse.json({ error: "No valid cart items" }, { status: 400, headers: { Allow: ALLOW_HEADER } });
    }

    if (!Number.isInteger(totalPaise) || totalPaise <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400, headers: { Allow: ALLOW_HEADER } });
    }

    const guestData = isGuest ? (parsed.data as z.infer<typeof guestCartSchema>) : null;

    const orderPayload: Record<string, unknown> = {
      user_id: user?.id ?? null,
      email: guestData?.email ?? user?.email ?? "",
      name: guestData?.name ?? null,
      phone: guestData?.phone ?? null,
      status: "pending",
      amount: totalPaise,
      currency: "INR",
      razorpay_order_id: null,
    };

    if (guestData?.address_line1) orderPayload.address_line1 = guestData.address_line1;
    if (guestData?.address_line2) orderPayload.address_line2 = guestData.address_line2;
    if (guestData?.city) orderPayload.city = guestData.city;
    if (guestData?.state) orderPayload.state = guestData.state;
    if (guestData?.pincode) orderPayload.pincode = guestData.pincode;
    if (guestData?.country) orderPayload.country = guestData.country;

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (orderErr || !order) {
      serverError("orders cart insert order", orderErr ?? "order missing");
      return NextResponse.json({ error: "Order creation failed" }, { status: 500, headers: { Allow: ALLOW_HEADER } });
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
      return NextResponse.json({ error: "Order creation failed" }, { status: 500, headers: { Allow: ALLOW_HEADER } });
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
      if (!Number.isInteger(razorpayAmount) || razorpayAmount <= 0) {
        throw new Error(`Invalid Razorpay amount returned: ${String(razorpayOrder.amount)}`);
      }
      if (String(razorpayCurrency).toUpperCase() !== "INR") {
        throw new Error(`Invalid Razorpay currency returned: ${String(razorpayCurrency)}`);
      }
    } catch (error) {
      serverError("orders cart razorpay", error);
      await admin
        .from("orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      return NextResponse.json({ error: "Payment gateway error" }, { status: 500, headers: { Allow: ALLOW_HEADER } });
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
      return NextResponse.json({ error: "Order creation failed" }, { status: 500, headers: { Allow: ALLOW_HEADER } });
    }

    serverWarn(
      "orders cart diagnostics",
      `Checkout diagnostics: orderId=${order.id} razorpayOrderId=${razorpayOrderId} amount=${razorpayAmount} currency=${razorpayCurrency}`,
    );

    return NextResponse.json(
      {
        orderId: order.id,
        razorpayOrderId,
        amount: razorpayAmount,
        currency: razorpayCurrency,
        keyId,
      },
      { status: 200, headers: { Allow: ALLOW_HEADER } },
    );
  } catch (error) {
    serverError("orders cart", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500, headers: { Allow: ALLOW_HEADER } });
  }
}
