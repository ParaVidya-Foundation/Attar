/**
 * GET /api/orders/status — Check order status by orderId or razorpay_order_id.
 * Requires authentication. Users can only query their own orders (RLS enforced).
 */
import { createServerClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/security/logger";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { z } from "zod";
import { NextResponse } from "next/server";

const querySchema = z.object({
  orderId: z.string().uuid().optional(),
  razorpayOrderId: z.string().min(1).optional(),
}).refine((d) => d.orderId || d.razorpayOrderId, { message: "orderId or razorpayOrderId required" });

export async function GET(req: Request) {
  const identifier = getClientIdentifier(req);
  const rl = await rateLimit(identifier, 30, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      orderId: searchParams.get("orderId") || undefined,
      razorpayOrderId: searchParams.get("razorpayOrderId") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    let query = supabase.from("orders").select("id, status, razorpay_order_id, created_at");

    if (parsed.data.orderId) {
      query = query.eq("id", parsed.data.orderId);
    } else if (parsed.data.razorpayOrderId) {
      query = query.eq("razorpay_order_id", parsed.data.razorpayOrderId);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      razorpayOrderId: order.razorpay_order_id,
      createdAt: order.created_at,
    });
  } catch (err) {
    serverError("orders status", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
