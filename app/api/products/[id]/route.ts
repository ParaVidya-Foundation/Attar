import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, original_price, image_url, is_active")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data || !data.is_active) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      slug: data.slug,
      price: data.price,
      original_price: data.original_price,
      image: data.image_url || `/products/${data.slug}.webp`,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
