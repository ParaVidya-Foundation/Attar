import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";

export type ProductWithVariants = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  variants: { size_ml: number; price: number; stock: number }[];
  image_url?: string | null;
};

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) {
      if (error) serverError("admin productQueries getProductById", error);
      return null;
    }

    const [variantsRes, imgRes] = await Promise.all([
      supabase.from("product_variants").select("size_ml,price,stock").eq("product_id", id),
      supabase.from("product_images").select("image_url").eq("product_id", id).order("is_primary", { ascending: false }).order("sort_order").limit(1),
    ]);

    const variants = (variantsRes.data ?? []).map((v) => ({
      size_ml: v.size_ml,
      price: v.price,
      stock: v.stock ?? 0,
    }));
    const image_url = imgRes.data?.[0]?.image_url ?? null;

    return {
      ...product,
      variants,
      image_url,
    } as ProductWithVariants;
  } catch (err) {
    serverError("admin productQueries getProductById", err);
    throw err;
  }
}
