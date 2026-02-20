/**
 * POST /api/orders — Create order and return Razorpay checkout info
 * Validates cart server-side, looks up prices from DB, creates Razorpay order.
 * Never trusts client-supplied prices.
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { getServerEnv } from "@/lib/env";
import { z } from "zod";
import { NextResponse } from "next/server";

const cartItemSchema = z.object({
  productId: z.string().uuid(),
  size_ml: z.number().int().positive(),
  qty: z.number().int().min(1).max(99),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cart payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const items = parsed.data.items;

    const resolved: Array<{
      productId: string;
      size_ml: number;
      qty: number;
      unit_price: number;
    }> = [];
    let total = 0;

    for (const item of items) {
      const { data: sizeRow } = await admin
        .from("product_sizes")
        .select("price")
        .eq("product_id", item.productId)
        .eq("size_ml", item.size_ml)
        .single();

      const { data: invRow } = await admin
        .from("inventory")
        .select("stock")
        .eq("product_id", item.productId)
        .eq("size_ml", item.size_ml)
        .single();

      if (!sizeRow) {
        return NextResponse.json(
          { error: `Product size not found: ${item.productId}/${item.size_ml}ml` },
          { status: 400 },
        );
      }

      const stock = invRow?.stock ?? 0;
      if (stock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${item.productId} size ${item.size_ml}ml` },
          { status: 400 },
        );
      }

      resolved.push({
        productId: item.productId,
        size_ml: item.size_ml,
        qty: item.qty,
        unit_price: sizeRow.price,
      });
      total += sizeRow.price * item.qty;
    }

    if (resolved.length === 0) {
      return NextResponse.json({ error: "No valid cart items" }, { status: 400 });
    }

    const receipt = `ord_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({
      amount: total * 100,
      currency: "INR",
      receipt,
    });

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total_amount: total,
        currency: "INR",
        razorpay_order_id: razorpayOrder.id,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.error("[orders/create] Order insert failed:", orderErr);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    const orderItems = resolved.map((r) => ({
      order_id: order.id,
      product_id: r.productId,
      size_ml: r.size_ml,
      qty: r.qty,
      unit_price: r.unit_price,
    }));

    const { error: itemsErr } = await admin.from("order_items").insert(orderItems);
    if (itemsErr) {
      console.error("[orders/create] Order items insert failed:", itemsErr);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }

    // Use safe env access
    const env = getServerEnv();
    const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      console.error("[orders] NEXT_PUBLIC_RAZORPAY_KEY_ID not configured");
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
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
    console.error("[orders/create] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
