import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  // Debug logging to help diagnose production issues
  // (safe to leave in production; does not leak sensitive data)
  console.info("[PRODUCT API] Fetching product", { id, looksLikeUuid: isUuid(id) });

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, original_price, image_url, is_active")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data || !data.is_active) {
      console.warn("[PRODUCT API] Product not found or inactive", { id, error });
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const response = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      price: data.price,
      original_price: data.original_price,
      image: data.image_url || `/products/${data.slug}.webp`,
    };

    console.info("[PRODUCT API] Product found", response);

    return NextResponse.json(response);
  } catch (err) {
    console.error("[PRODUCT API] Internal error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
