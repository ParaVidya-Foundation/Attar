import type { Product } from "@/types/product";
import { createStaticClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/security/logger";

export type NakshatraAttarProduct = Pick<
  Product,
  "id" | "name" | "slug" | "short_description" | "price" | "original_price"
>;

const NAKSHATRA_QUERY_COLUMNS =
  "id,name,slug,short_description,price,original_price";

export async function getNakshatraAttars(): Promise<Product[]> {
  const supabase = createStaticClient();

  try {
    const { data, error } = await supabase
      .from("products")
      .select(NAKSHATRA_QUERY_COLUMNS)
      .like("slug", "%nakshatra-attar")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      serverError("getNakshatraAttars", error);
      return [];
    }

    return (data ?? []) as Product[];
  } catch (err) {
    serverError("getNakshatraAttars exception", err);
    return [];
  }
}

