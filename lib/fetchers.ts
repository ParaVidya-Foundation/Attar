import { createStaticClient } from "@/lib/supabase/server";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string;
  price: number;
  original_price: number | null;
  is_active: boolean;
  created_at: string | null;
};

const PRODUCT_COLUMNS =
  "id,name,slug,description,short_description,category_id,price,original_price,is_active,created_at";

export async function getCategories(): Promise<CategoryRow[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase.from("categories").select("id,name,slug").order("name");

    if (error) {
      console.error("[Supabase] getCategories failed:", error);
      return [];
    }

    if (!data) return [];
    return data as CategoryRow[];
  } catch (error) {
    console.error("[Supabase] getCategories exception:", error);
    return [];
  }
}

export async function getProductsByCategorySlug(slug: string): Promise<ProductRow[]> {
  try {
    const supabase = createStaticClient();
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (categoryError) {
      console.error("[Supabase] getProductsByCategorySlug category lookup failed:", categoryError);
      return [];
    }

    console.log("CATEGORY:", slug, "→", category?.id ?? "NOT FOUND");
    if (!category?.id) return [];

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] getProductsByCategorySlug products fetch failed:", error);
      return [];
    }

    console.log("TEST PRODUCTS COUNT:", data?.length);
    if (!data) return [];
    return data as ProductRow[];
  } catch (error) {
    console.error("[Supabase] getProductsByCategorySlug exception:", error);
    return [];
  }
}

export async function getAllActiveProducts(): Promise<ProductRow[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] getAllActiveProducts failed:", error);
      return [];
    }

    if (!data) return [];
    return data as ProductRow[];
  } catch (error) {
    console.error("[Supabase] getAllActiveProducts exception:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("[Supabase] getProductBySlug failed:", error);
      return null;
    }

    if (!data) return null;
    return data as ProductRow;
  } catch (error) {
    console.error("[Supabase] getProductBySlug exception:", error);
    return null;
  }
}
