import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";
import type { ServiceResult } from "./types";
import { success, fail } from "./types";

export type ProductRow = {
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
  min_price?: number;
  total_stock?: number;
  image_url?: string | null;
};

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

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export async function getProducts(
  page = 1,
  search?: string,
  pageSize = 20,
): Promise<ServiceResult<{ data: ProductRow[]; total: number }>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const safePage = Math.max(1, page);
    const safeSize = Math.min(Math.max(1, pageSize), 100);
    const from = (safePage - 1) * safeSize;
    const to = from + safeSize - 1;

    let query = supabase
      .from("products")
      .select(
        "id,name,slug,description,short_description,category_id,price,original_price,is_active,meta_title,meta_description,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      serverError("products.service getProducts", error);
      return fail(error.message);
    }

    const rows = (products ?? []) as ProductRow[];
    if (rows.length === 0) return success({ data: rows, total: count ?? 0 });

    const ids = rows.map((p) => p.id);
    const [variantsRes, imagesRes] = await Promise.all([
      supabase.from("product_variants").select("product_id,price,stock").in("product_id", ids),
      supabase
        .from("product_images")
        .select("product_id,image_url,is_primary")
        .in("product_id", ids)
        .order("is_primary", { ascending: false }),
    ]);

    const variantSums = new Map<string, { minPrice: number; totalStock: number }>();
    (variantsRes.data ?? []).forEach((v: { product_id: string; price: number; stock: number }) => {
      const curr = variantSums.get(v.product_id) ?? { minPrice: v.price, totalStock: 0 };
      curr.minPrice = Math.min(curr.minPrice, v.price);
      curr.totalStock += v.stock ?? 0;
      variantSums.set(v.product_id, curr);
    });

    const imageByProduct = new Map<string, string>();
    (imagesRes.data ?? []).forEach((img: { product_id: string; image_url: string }) => {
      if (!imageByProduct.has(img.product_id)) imageByProduct.set(img.product_id, img.image_url);
    });

    const data: ProductRow[] = rows.map((p) => {
      const v = variantSums.get(p.id);
      return { ...p, min_price: v ? v.minPrice : p.price, total_stock: v?.totalStock ?? 0, image_url: imageByProduct.get(p.id) ?? null };
    });

    return success({ data, total: count ?? 0 });
  } catch (err) {
    serverError("products.service getProducts", err);
    return fail("Failed to fetch products");
  }
}

export async function getProductById(id: string): Promise<ServiceResult<ProductWithVariants | null>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !product) return success(null);

    const [variantsRes, imgRes] = await Promise.all([
      supabase.from("product_variants").select("size_ml,price,stock").eq("product_id", id),
      supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id)
        .order("is_primary", { ascending: false })
        .order("sort_order")
        .limit(1),
    ]);

    return success({
      ...product,
      variants: (variantsRes.data ?? []).map((v) => ({
        size_ml: v.size_ml,
        price: v.price,
        stock: v.stock ?? 0,
      })),
      image_url: imgRes.data?.[0]?.image_url ?? null,
    } as ProductWithVariants);
  } catch (err) {
    serverError("products.service getProductById", err);
    return fail("Failed to fetch product");
  }
}

export async function getCategories(): Promise<ServiceResult<CategoryRow[]>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug")
      .order("name");

    if (error) return fail(error.message);
    return success((data ?? []) as CategoryRow[]);
  } catch (err) {
    serverError("products.service getCategories", err);
    return fail("Failed to fetch categories");
  }
}
