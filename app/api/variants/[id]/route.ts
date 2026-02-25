import { createAdminClient } from "@/lib/supabase/admin";
import { serverError } from "@/lib/security/logger";
import { NextResponse } from "next/server";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeVariantId(raw: string): string {
  const trimmed = (raw ?? "").trim();
  return trimmed.startsWith("=") ? trimmed.slice(1).trim() : trimmed;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const variantId = sanitizeVariantId(rawId);

  if (!variantId) {
    return NextResponse.json({ error: "Missing variant id" }, { status: 400 });
  }
  if (!UUID_REGEX.test(variantId)) {
    return NextResponse.json({ error: "Invalid variant id" }, { status: 400 });
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

    const imageUrl =
      images?.[0]?.image_url && images[0].image_url.trim().length > 0
        ? images[0].image_url.trim()
        : PLACEHOLDER_IMAGE_URL;

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
    serverError("variants API", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
