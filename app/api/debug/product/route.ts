import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * GET /api/debug/product?id=... — Disabled in production.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id query parameter" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

