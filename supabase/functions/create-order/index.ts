/**
 * Supabase Edge Function: create-order
 * Invoked by Next.js API with JWT
 * Validates cart, creates order, calls Razorpay, returns order info
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: string;
  size_ml: number;
  qty: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.info("[create-order] Missing or invalid Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      console.error("[create-order] RAZORPAY_KEY_SECRET not set");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      console.info("[create-order] Auth failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const cart = body?.cart?.items as CartItem[] | undefined;
    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid cart" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate items and get prices + inventory
    const resolved: Array<{ productId: string; size_ml: number; qty: number; unit_price: number }> = [];
    let total = 0;

    for (const item of cart) {
      const pid = String(item?.productId ?? "");
      const sizeMl = Number(item?.size_ml) || 0;
      const qty = Math.max(1, Math.min(99, Number(item?.qty) || 1));

      if (!pid || sizeMl <= 0) continue;

      const { data: sizeRow } = await admin
        .from("product_sizes")
        .select("price")
        .eq("product_id", pid)
        .eq("size_ml", sizeMl)
        .single();

      const { data: invRow } = await admin
        .from("inventory")
        .select("stock")
        .eq("product_id", pid)
        .eq("size_ml", sizeMl)
        .single();

      if (!sizeRow || !invRow) {
        return new Response(JSON.stringify({ error: `Product or size not found: ${pid}/${sizeMl}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const stock = invRow.stock ?? 0;
      if (stock < qty) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for product ${pid} size ${sizeMl}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const unitPrice = sizeRow.price;
      resolved.push({ productId: pid, size_ml: sizeMl, qty, unit_price: unitPrice });
      total += unitPrice * qty;
    }

    if (resolved.length === 0) {
      return new Response(JSON.stringify({ error: "No valid cart items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountPaise = total * 100;
    const receipt = `ord_${Date.now()}`;

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(Deno.env.get("NEXT_PUBLIC_RAZORPAY_KEY_ID") + ":" + razorpayKeySecret),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
      }),
    });

    if (!razorpayRes.ok) {
      const err = await razorpayRes.text();
      console.error("[create-order] Razorpay error:", err);
      return new Response(JSON.stringify({ error: "Payment provider error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpayOrder = await razorpayRes.json();
    const razorpayOrderId = razorpayOrder.id;

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "created",
        total_amount: total,
        currency: "INR",
        razorpay_order_id: razorpayOrderId,
      })
      .select("id")
      .single();

    if (orderErr) {
      console.error("[create-order] Order insert failed:", orderErr);
      return new Response(JSON.stringify({ error: "Order creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      console.error("[create-order] Order items insert failed:", itemsErr);
      // TODO: Compensate — cancel Razorpay order or mark order failed
      return new Response(JSON.stringify({ error: "Order creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Decrement inventory atomically (move to update-inventory Edge Fn after payment)
    console.info("[create-order] Order created:", order.id, "razorpay:", razorpayOrderId);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        razorpayOrder: {
          id: razorpayOrderId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[create-order] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
