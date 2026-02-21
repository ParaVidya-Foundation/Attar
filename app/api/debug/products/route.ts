/**
 * GET /api/debug/products — Server-side health check for product visibility.
 * Query: select id from products where is_active = true limit 5
 * Return: { count, error }. If count = 0 but DB has data → RLS or env failure.
 * Call during build/start and log result to server console.
 */
import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  let supabase: ReturnType<typeof createStaticClient>;
  try {
    supabase = createStaticClient();
  } catch (e) {
    const err = e instanceof Error ? e.message : "Supabase client not initialized";
    console.error("[api/debug/products]", err);
    return NextResponse.json({ count: 0, error: err });
  }
  if (!supabase) {
    const err = "Supabase client not initialized (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)";
    console.error("[api/debug/products]", err);
    return NextResponse.json({ count: 0, error: err });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true)
    .limit(5);

  if (error) {
    console.error("[api/debug/products] Supabase error:", error.message);
    return NextResponse.json({ count: 0, error: error.message });
  }

  const list = data ?? [];
  const count = list.length;
  if (count === 0) {
    console.warn("[api/debug/products] count=0 — if DB has active products, check RLS or env.");
  }
  return NextResponse.json({ count, error: null });
}
