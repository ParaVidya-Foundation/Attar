/**
 * GET /api/debug/products — Disabled in production. Dev-only product visibility check.
 */
import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let supabase: ReturnType<typeof createStaticClient>;
  try {
    supabase = createStaticClient();
  } catch {
    return NextResponse.json({ count: 0, error: "Client not initialized" });
  }
  if (!supabase) {
    return NextResponse.json({ count: 0, error: "Client not initialized" });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("is_active", true)
    .limit(5);

  if (error) {
    return NextResponse.json({ count: 0, error: "Query failed" });
  }

  const count = (data ?? []).length;
  return NextResponse.json({ count, error: null });
}
