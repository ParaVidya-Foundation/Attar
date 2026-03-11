/**
 * Production Product API layer — server-side only.
 * Supabase as single source of truth. Safe query path: products first, then images/variants by product IDs, merge in memory.
 */
import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/server";
import { serverError, serverWarn } from "@/lib/security/logger";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";
import type { Product, ProductVariant, ProductImage, ProductDisplay } from "@/types/product";

export const revalidate = 60;

function logError(context: string, err: unknown) {
  serverError(`api/products ${context}`, err);
}

/** Relational row from Supabase (products + nested images, variants) */
type ProductRow = Product & {
  product_images?: (Pick<ProductImage, "id" | "product_id" | "image_url" | "is_primary" | "sort_order">)[];
  product_variants?: ProductVariant[];
};

const PRODUCT_COLUMNS =
  "id,name,slug,description,short_description,price,original_price,is_active,featured,category_id,meta_title,meta_description,created_at,updated_at";

const PRODUCT_IMAGE_COLUMNS = "id,product_id,image_url,is_primary,sort_order";
const PRODUCT_VARIANT_COLUMNS = "id,product_id,size_ml,price,stock,sku";

function sortImages(
  images: { image_url: string; is_primary?: boolean; sort_order?: number }[],
): { url: string }[] {
  const cleaned = images
    .map((img) => ({
      ...img,
      image_url: typeof img.image_url === "string" ? img.image_url.trim() : "",
    }))
    .filter((img) => img.image_url);

  if (cleaned.length === 0) {
    return [{ url: PLACEHOLDER_IMAGE_URL }];
  }

  const sorted = [...cleaned]
    .sort((a, b) => {
      const aPrimary = a.is_primary ?? false;
      const bPrimary = b.is_primary ?? false;
      if (aPrimary && !bPrimary) return -1;
      if (!aPrimary && bPrimary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((img) => ({ url: img.image_url }));

  return sorted;
}

function pickPrice(productPrice: number, variants: ProductVariant[]): number {
  if (variants.length === 0) return productPrice;
  return Math.min(...variants.map((v) => v.price));
}

function toProductDisplay(
  row: ProductRow,
  categorySlug: string | null,
): ProductDisplay {
  const variants = row.product_variants ?? [];
  const rawImages = row.product_images ?? [];
  const images = sortImages(rawImages);
  const price = pickPrice(row.price, variants);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    short_description: row.short_description ?? null,
    price,
    original_price: row.original_price ?? null,
    images,
    category_slug: categorySlug,
    variants,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    featured: row.featured ?? false,
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? null,
  };
}

type SupabaseClient = ReturnType<typeof createStaticClient> extends infer T
  ? T extends null ? never : T
  : never;

/**
 * Safe path: fetch products (no nested relations), then images and variants by product_id, merge in memory.
 */
async function fetchProductRows(
  supabase: SupabaseClient,
  options: { categoryId?: string; featured?: boolean; slug?: string },
): Promise<ProductRow[]> {
  if (options.slug) {
    const { data: product, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", options.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      logError("fetchProductRows (by slug) products", error);
      return [];
    }
    if (!product) return [];
    const [imagesRes, variantsRes] = await Promise.all([
      supabase
        .from("product_images")
        .select(PRODUCT_IMAGE_COLUMNS)
        .eq("product_id", product.id)
        .order("sort_order", { ascending: true }),
      supabase.from("product_variants").select(PRODUCT_VARIANT_COLUMNS).eq("product_id", product.id),
    ]);
    if (imagesRes.error) logError("fetchProductRows (by slug) product_images", imagesRes.error);
    if (variantsRes.error) logError("fetchProductRows (by slug) product_variants", variantsRes.error);
    const productRow: ProductRow = {
      ...(product as Product),
      product_images: imagesRes.data ?? [],
      product_variants: (variantsRes.data ?? []) as ProductVariant[],
    };
    return [productRow];
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (options.categoryId) query = query.eq("category_id", options.categoryId);
  if (options.featured === true) query = query.eq("featured", true);

  const { data: products, error } = await query;
  if (error) {
    logError("fetchProductRows products", error);
    return [];
  }
  if (!products?.length) return [];

  const ids = products.map((p: { id: string }) => p.id);
  const [imagesRes, variantsRes] = await Promise.all([
    supabase
      .from("product_images")
      .select(PRODUCT_IMAGE_COLUMNS)
      .in("product_id", ids)
      .order("sort_order", { ascending: true }),
    supabase.from("product_variants").select(PRODUCT_VARIANT_COLUMNS).in("product_id", ids),
  ]);
  if (imagesRes.error) logError("fetchProductRows product_images", imagesRes.error);
  if (variantsRes.error) logError("fetchProductRows product_variants", variantsRes.error);
  type ImageRow = NonNullable<ProductRow["product_images"]>[number];
  const imagesByProduct = new Map<string, ImageRow[]>();
  (imagesRes.data ?? []).forEach((img: { product_id: string; [k: string]: unknown }) => {
    const list = imagesByProduct.get(img.product_id) ?? [];
    list.push(img as ImageRow);
    imagesByProduct.set(img.product_id, list);
  });
  const variantsByProduct = new Map<string, ProductVariant[]>();
  (variantsRes.data ?? []).forEach((v: ProductVariant) => {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  });

  return (products as Product[]).map((p) => ({
    ...p,
    product_images: imagesByProduct.get(p.id) ?? [],
    product_variants: variantsByProduct.get(p.id) ?? [],
  })) as ProductRow[];
}

/**
 * Fetch all active products with images and variants (safe path: products then images/variants by id).
 */
export async function getAllProducts(): Promise<ProductDisplay[]> {
  try {
    const supabase = createStaticClient();
    const rows = await fetchProductRows(supabase, {});
    if (rows.length === 0) {
      serverError("api/products", "getAllProducts returned zero active products");
      return [];
    }

    const categoryIds = [...new Set(rows.map((p) => p.category_id).filter(Boolean))] as string[];
    const categoryMap = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id,slug")
        .in("id", categoryIds);
      (categories ?? []).forEach((c: { id: string; slug: string }) => categoryMap.set(c.id, c.slug));
    }

    const products = rows.map((p) =>
      toProductDisplay(p, p.category_id ? categoryMap.get(p.category_id) ?? null : null),
    );
    serverWarn("api/products", `getAllProducts product_count=${products.length}`);
    return products;
  } catch (e) {
    logError("getAllProducts exception", e);
    return [];
  }
}

/**
 * Fetch featured active products (safe path).
 */
export async function getFeaturedProducts(): Promise<ProductDisplay[]> {
  try {
    const supabase = createStaticClient();
    const rows = await fetchProductRows(supabase, { featured: true });
    if (rows.length === 0) {
      serverWarn("api/products", "getFeaturedProducts returned zero featured active products");
      return [];
    }

    const categoryIds = [...new Set(rows.map((p) => p.category_id).filter(Boolean))] as string[];
    const categoryMap = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id,slug")
        .in("id", categoryIds);
      (categories ?? []).forEach((c: { id: string; slug: string }) => categoryMap.set(c.id, c.slug));
    }

    return rows.map((p) =>
      toProductDisplay(p, p.category_id ? categoryMap.get(p.category_id) ?? null : null),
    );
  } catch (e) {
    logError("getFeaturedProducts exception", e);
    return [];
  }
}

/**
 * Fetch single product by slug (safe path). Returns null if not found or inactive.
 * Cached per-request so generateMetadata and page share one fetch.
 */
export const getProductBySlug = cache(async function getProductBySlug(slug: string): Promise<ProductDisplay | null> {
  try {
    const supabase = createStaticClient();
    const rows = await fetchProductRows(supabase, { slug });
    const row = rows[0] ?? null;
    if (!row) return null;

    let categorySlug: string | null = null;
    if (row.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", row.category_id)
        .maybeSingle();
      categorySlug = cat?.slug ?? null;
    }
    return toProductDisplay(row, categorySlug);
  } catch (e) {
    logError("getProductBySlug exception", e);
    return null;
  }
});

/**
 * Fetch products by category slug. Returns [] if category not found; logs slug mismatch.
 */
export async function getProductsByCategory(categorySlug: string): Promise<ProductDisplay[]> {
  try {
    const supabase = createStaticClient();
    const { data: category, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (catErr) {
      logError("getProductsByCategory categories", catErr);
      return [];
    }
    if (!category?.id) {
      serverWarn("api/products", "category not found: " + categorySlug);
      return [];
    }

    const rows = await fetchProductRows(supabase, { categoryId: category.id });
    return rows.map((p) => toProductDisplay(p, categorySlug));
  } catch (e) {
    logError("getProductsByCategory exception", e);
    return [];
  }
}

/**
 * Recommended products for a given product slug.
 * Heuristic: products that share category and/or collections, excluding the current product.
 */
export async function getRecommendedProductsBySlug(
  slug: string,
  limit = 6,
): Promise<ProductDisplay[]> {
  try {
    const supabase = createStaticClient();

    // Base product (id + category)
    const { data: base, error: baseErr } = await supabase
      .from("products")
      .select("id, category_id")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (baseErr || !base) {
      if (baseErr) logError("getRecommendedProductsBySlug base", baseErr);
      return [];
    }

    const baseId: string = (base as { id: string }).id;
    const baseCategoryId: string | null = (base as { category_id: string | null }).category_id ?? null;

    const scores = new Map<string, number>();

    // 1) Same category candidates
    if (baseCategoryId) {
      const { data: sameCategory, error: catErr } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", baseCategoryId)
        .eq("is_active", true)
        .neq("id", baseId)
        .order("created_at", { ascending: false })
        .limit(limit * 3);

      if (catErr) {
        logError("getRecommendedProductsBySlug sameCategory", catErr);
      } else {
        for (const row of sameCategory ?? []) {
          const id = (row as { id: string }).id;
          scores.set(id, (scores.get(id) ?? 0) + 1);
        }
      }
    }

    // 2) Shared collections candidates
    const { data: baseCollections, error: baseCollErr } = await supabase
      .from("product_collections")
      .select("collection_id")
      .eq("product_id", baseId);

    if (baseCollErr) {
      logError("getRecommendedProductsBySlug baseCollections", baseCollErr);
    } else {
      const collectionIds = [...new Set((baseCollections ?? []).map((row) => row.collection_id))] as string[];

      if (collectionIds.length > 0) {
        const { data: relatedByCollections, error: relErr } = await supabase
          .from("product_collections")
          .select("product_id, collection_id")
          .in("collection_id", collectionIds)
          .neq("product_id", baseId);

        if (relErr) {
          logError("getRecommendedProductsBySlug relatedByCollections", relErr);
        } else {
          for (const row of relatedByCollections ?? []) {
            const id = (row as { product_id: string }).product_id;
            scores.set(id, (scores.get(id) ?? 0) + 1);
          }
        }
      }
    }

    const candidateIds = [...scores.keys()];
    if (candidateIds.length === 0) {
      return [];
    }

    // Fetch candidate product rows (images + variants) similar to fetchProductRows, but scoped to candidate ids.
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .in("id", candidateIds)
      .eq("is_active", true);

    if (prodErr || !products?.length) {
      if (prodErr) logError("getRecommendedProductsBySlug products", prodErr);
      return [];
    }

    const ids = (products as Product[]).map((p) => p.id);
    const [imagesRes, variantsRes] = await Promise.all([
      supabase
        .from("product_images")
        .select(PRODUCT_IMAGE_COLUMNS)
        .in("product_id", ids)
        .order("sort_order", { ascending: true }),
      supabase.from("product_variants").select(PRODUCT_VARIANT_COLUMNS).in("product_id", ids),
    ]);

    if (imagesRes.error) logError("getRecommendedProductsBySlug product_images", imagesRes.error);
    if (variantsRes.error) logError("getRecommendedProductsBySlug product_variants", variantsRes.error);

    type ImageRow = NonNullable<ProductRow["product_images"]>[number];
    const imagesByProduct = new Map<string, ImageRow[]>();
    (imagesRes.data ?? []).forEach((img: { product_id: string; [k: string]: unknown }) => {
      const list = imagesByProduct.get(img.product_id) ?? [];
      list.push(img as ImageRow);
      imagesByProduct.set(img.product_id, list);
    });

    const variantsByProduct = new Map<string, ProductVariant[]>();
    (variantsRes.data ?? []).forEach((v: ProductVariant) => {
      const list = variantsByProduct.get(v.product_id) ?? [];
      list.push(v);
      variantsByProduct.set(v.product_id, list);
    });

    let rows: ProductRow[] = (products as Product[]).map((p) => ({
      ...p,
      product_images: imagesByProduct.get(p.id) ?? [],
      product_variants: variantsByProduct.get(p.id) ?? [],
    })) as ProductRow[];

    // Relevance sort: more matching signals first, then newest.
    rows = rows.sort((a, b) => {
      const sa = scores.get(a.id) ?? 0;
      const sb = scores.get(b.id) ?? 0;
      if (sb !== sa) return sb - sa;
      const da = a.created_at ? new Date(a.created_at as string).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at as string).getTime() : 0;
      return db - da;
    });

    // Limit after sort.
    const limitedRows = rows.slice(0, limit);

    // Optionally resolve category slugs for completeness.
    const categoryIds = [...new Set(limitedRows.map((p) => p.category_id).filter(Boolean))] as string[];
    const categoryMap = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id,slug")
        .in("id", categoryIds);
      (categories ?? []).forEach((c: { id: string; slug: string }) => categoryMap.set(c.id, c.slug));
    }

    return limitedRows.map((p) =>
      toProductDisplay(p, p.category_id ? categoryMap.get(p.category_id) ?? null : null),
    );
  } catch (err) {
    logError("getRecommendedProductsBySlug exception", err);
    return [];
  }
}

/**
 * Fetch variants for a product (e.g. for cart/checkout).
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("product_variants")
      .select("id,product_id,size_ml,price,stock,sku")
      .eq("product_id", productId);

    if (error) {
      logError("getProductVariants", error);
      return [];
    }
    return (data ?? []) as ProductVariant[];
  } catch (e) {
    logError("getProductVariants exception", e);
    return [];
  }
}
