import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

function sanitizeVariantId(raw: string): string {
  const trimmed = (raw ?? "").trim();
  return trimmed.startsWith("=") ? trimmed.slice(1).trim() : trimmed;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const variantId = sanitizeVariantId(rawId);

  console.log("[VARIANT API] id:", variantId);

  if (!variantId) {
    return NextResponse.json({ error: "Missing variant id" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: variant, error: varErr } = await supabase
      .from("product_variants")
      .select("*")
      .eq("id", variantId)
      .single();

    if (varErr || !variant) {
      return NextResponse.json({ error: "Variant not found or inactive" }, { status: 404 });
    }

    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id, name, slug, is_active")
      .eq("id", variant.product_id)
      .single();

    if (prodErr || !product || !product.is_active) {
      return NextResponse.json({ error: "Variant not found or inactive" }, { status: 404 });
    }

    const { data: images } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })
      .limit(1);

    const imageUrl = images?.[0]?.image_url ?? `/products/${product.slug}.webp`;

    return NextResponse.json({
      variant: {
        id: variant.id,
        size_ml: variant.size_ml,
        price: variant.price,
        stock: variant.stock,
      },
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: imageUrl,
      },
    });
  } catch (err) {
    console.error("[VARIANTS API] Internal error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
