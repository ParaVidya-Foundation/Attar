import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * GET /api/debug/product?id=...
 *
 * Debug endpoint to inspect raw product rows in production.
 * Do NOT expose sensitive data; this only returns the products row.
 */
export async function GET(req: Request) {
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
      console.warn("[DEBUG PRODUCT] Not found", { id, error });
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    console.info("[DEBUG PRODUCT] Found product", { id, productId: data.id, slug: data.slug });

    return NextResponse.json({ product: data });
  } catch (err) {
    console.error("[DEBUG PRODUCT] Internal error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

