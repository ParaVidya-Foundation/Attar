/**
 * POST /api/orders — Create order and return Razorpay checkout info
 * Forwards to Supabase Edge Function create-order
 * Server-only; validates cart with zod
 */
import { createClient } from "@/lib/supabase/server";
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

  // TODO: Support anonymous checkout — for now require auth
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fnUrl = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/create-order`;
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cart: parsed.data }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error ?? "Order creation failed" },
      { status: res.status >= 400 ? res.status : 500 },
    );
  }

  return NextResponse.json(data);
}
