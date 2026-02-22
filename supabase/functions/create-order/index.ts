/**
 * Supabase Edge Function: create-order
 * Invoked by Next.js API with JWT
 * Validates cart (variant_id + quantity), creates order, calls Razorpay, returns order info
 */
/// <reference path="./globals.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  variant_id: string;
  quantity: number;
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

    const resolved: Array<{ product_id: string; variant_id: string; quantity: number; price: number }> = [];
    let totalPaise = 0;

    for (const item of cart) {
      const variantId = String(item?.variant_id ?? "").trim();
      const qty = Math.max(1, Math.min(99, Number(item?.quantity) || 1));
      if (!variantId) continue;

      const { data: variant } = await admin
        .from("product_variants")
        .select("id, product_id, price, stock")
        .eq("id", variantId)
        .single();

      if (!variant) {
        return new Response(JSON.stringify({ error: `Variant not found: ${variantId}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Inventory not enforced (unlimited mode)
      const price = variant.price;
      resolved.push({
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity: qty,
        price,
      });
      totalPaise += price * qty;
    }

    if (resolved.length === 0) {
      return new Response(JSON.stringify({ error: "No valid cart items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const receipt = `ord_${Date.now()}`;
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(Deno.env.get("NEXT_PUBLIC_RAZORPAY_KEY_ID") + ":" + razorpayKeySecret),
      },
      body: JSON.stringify({
        amount: totalPaise,
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
        email: user.email ?? "",
        status: "pending",
        amount: totalPaise,
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
      product_id: r.product_id,
      variant_id: r.variant_id,
      quantity: r.quantity,
      price: r.price,
    }));

    const { error: itemsErr } = await admin.from("order_items").insert(orderItems);
    if (itemsErr) {
      console.error("[create-order] Order items insert failed:", itemsErr);
      return new Response(JSON.stringify({ error: "Order creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
