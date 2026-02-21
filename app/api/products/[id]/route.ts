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

  console.info("[PRODUCT API] Fetching product", { id, looksLikeUuid: isUuid(id) });

  try {
    const supabase = createAdminClient();
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, name, slug, price, original_price, is_active")
      .eq("id", id)
      .single();

    if (productErr || !product || !product.is_active) {
      console.warn("[PRODUCT API] Product not found or inactive", { id, error: productErr });
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, product_id, size_ml, price, stock")
      .eq("product_id", id);

    const { data: images } = await supabase
      .from("product_images")
      .select("image_url, is_primary, sort_order")
      .eq("product_id", id)
      .order("sort_order", { ascending: true })
      .limit(1);

    const imageUrl = images?.[0]?.image_url ?? `/products/${product.slug}.webp`;

    const response = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      original_price: product.original_price,
      image: imageUrl,
      variants: (variants ?? []).map((v) => ({
        id: v.id,
        size_ml: v.size_ml,
        price: v.price,
        stock: v.stock,
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[PRODUCT API] Internal error", {
      id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
