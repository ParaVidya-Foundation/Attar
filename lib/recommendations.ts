import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";
import type { Product, ProductDisplay, ProductImage, ProductVariant } from "@/types/product";

type ProductRow = Product & {
  product_images?: (Pick<ProductImage, "id" | "product_id" | "image_url" | "is_primary" | "sort_order">)[];
  product_variants?: ProductVariant[];
};

type RecommendationEventType = "view_product" | "add_to_cart" | "purchase";

const PRODUCT_COLUMNS =
  "id,name,slug,description,short_description,price,original_price,is_active,featured,category_id,meta_title,meta_description,created_at,updated_at";
const PRODUCT_IMAGE_COLUMNS = "id,product_id,image_url,is_primary,sort_order";
const PRODUCT_VARIANT_COLUMNS = "id,product_id,size_ml,price,stock,sku";
const PAID_ORDER_STATUSES = ["paid", "shipped", "delivered"] as const;

function pickPrice(productPrice: number, variants: ProductVariant[]): number {
  if (variants.length === 0) return productPrice;
  return Math.min(...variants.map((variant) => variant.price));
}

function sortImages(
  images: { image_url: string; is_primary?: boolean; sort_order?: number }[],
): { url: string }[] {
  const cleaned = images
    .map((image) => ({
      ...image,
      image_url: typeof image.image_url === "string" ? image.image_url.trim() : "",
    }))
    .filter((image) => image.image_url);

  if (cleaned.length === 0) {
    return [{ url: PLACEHOLDER_IMAGE_URL }];
  }

  return [...cleaned]
    .sort((a, b) => {
      const aPrimary = a.is_primary ?? false;
      const bPrimary = b.is_primary ?? false;
      if (aPrimary && !bPrimary) return -1;
      if (!aPrimary && bPrimary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((image) => ({ url: image.image_url }));
}

function toProductDisplay(row: ProductRow, categorySlug: string | null): ProductDisplay {
  const variants = row.product_variants ?? [];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    short_description: row.short_description ?? null,
    price: pickPrice(row.price, variants),
    original_price: row.original_price ?? null,
    images: sortImages(row.product_images ?? []),
    category_slug: categorySlug,
    variants,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    featured: row.featured ?? false,
    is_active: row.is_active ?? true,
    created_at: row.created_at ?? null,
  };
}

async function fetchProductDisplaysByIds(ids: string[]): Promise<ProductDisplay[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("id", uniqueIds)
    .eq("is_active", true);

  if (!products?.length) return [];

  const productIds = (products as Product[]).map((product) => product.id);
  const categoryIds = [...new Set((products as Product[]).map((product) => product.category_id).filter(Boolean))] as string[];

  const [imagesRes, variantsRes, categoriesRes] = await Promise.all([
    admin.from("product_images").select(PRODUCT_IMAGE_COLUMNS).in("product_id", productIds).order("sort_order"),
    admin.from("product_variants").select(PRODUCT_VARIANT_COLUMNS).in("product_id", productIds),
    categoryIds.length > 0
      ? admin.from("categories").select("id,slug").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  type ImageRow = NonNullable<ProductRow["product_images"]>[number];
  const imagesByProduct = new Map<string, ImageRow[]>();
  for (const image of imagesRes.data ?? []) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image as ImageRow);
    imagesByProduct.set(image.product_id, list);
  }

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const variant of (variantsRes.data ?? []) as ProductVariant[]) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  const categorySlugById = new Map<string, string>();
  for (const category of categoriesRes.data ?? []) {
    categorySlugById.set(category.id, category.slug);
  }

  const rows = (products as Product[]).map((product) => ({
    ...product,
    product_images: imagesByProduct.get(product.id) ?? [],
    product_variants: variantsByProduct.get(product.id) ?? [],
  })) as ProductRow[];

  return rows.map((row) => toProductDisplay(row, row.category_id ? categorySlugById.get(row.category_id) ?? null : null));
}

function sortRecommendationProducts(
  products: ProductDisplay[],
  scores: Map<string, number>,
  limit: number,
) {
  return [...products]
    .sort((a, b) => {
      const scoreDelta = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
      if (scoreDelta !== 0) return scoreDelta;
      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bCreated - aCreated;
    })
    .slice(0, limit);
}

async function buildContextualRecommendations(
  seedProductIds: string[],
  options?: { excludeIds?: string[]; limit?: number },
): Promise<ProductDisplay[]> {
  const uniqueSeedIds = [...new Set(seedProductIds.filter(Boolean))];
  if (uniqueSeedIds.length === 0) return [];

  const excludeIds = new Set([...(options?.excludeIds ?? []), ...uniqueSeedIds]);
  const limit = options?.limit ?? 4;
  const admin = createAdminClient();
  const scores = new Map<string, number>();

  const { data: seedProducts } = await admin
    .from("products")
    .select("id,category_id")
    .in("id", uniqueSeedIds)
    .eq("is_active", true);

  if (!seedProducts?.length) return [];

  const categoryIds = [...new Set(seedProducts.map((product) => product.category_id).filter(Boolean))] as string[];

  if (categoryIds.length > 0) {
    const { data: sameCategory } = await admin
      .from("products")
      .select("id,category_id")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .limit(Math.max(limit * 12, 24));

    for (const product of sameCategory ?? []) {
      if (excludeIds.has(product.id)) continue;
      scores.set(product.id, (scores.get(product.id) ?? 0) + 3);
    }
  }

  const { data: seedCollections } = await admin
    .from("product_collections")
    .select("collection_id")
    .in("product_id", uniqueSeedIds);

  const collectionIds = [...new Set((seedCollections ?? []).map((entry) => entry.collection_id))] as string[];

  if (collectionIds.length > 0) {
    const { data: relatedCollections } = await admin
      .from("product_collections")
      .select("product_id")
      .in("collection_id", collectionIds);

    for (const entry of relatedCollections ?? []) {
      if (excludeIds.has(entry.product_id)) continue;
      scores.set(entry.product_id, (scores.get(entry.product_id) ?? 0) + 2);
    }
  }

  let candidateIds = [...scores.keys()];
  if (candidateIds.length === 0) {
    const { data: fallbackProducts } = await admin
      .from("products")
      .select("id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(Math.max(limit * 4, 8));

    candidateIds = (fallbackProducts ?? [])
      .map((product) => product.id)
      .filter((id) => !excludeIds.has(id));
    for (const id of candidateIds) {
      scores.set(id, scores.get(id) ?? 1);
    }
  }

  const displays = await fetchProductDisplaysByIds(candidateIds);
  return sortRecommendationProducts(
    displays.filter((product) => !excludeIds.has(product.id)),
    scores,
    limit,
  );
}

export const getBehavioralRecommendations = cache(async function getBehavioralRecommendations(
  productId: string,
  limit = 4,
): Promise<ProductDisplay[]> {
  try {
    const admin = createAdminClient();
    const scores = new Map<string, number>();

    const { data: seedEvents } = await admin
      .from("user_events")
      .select("user_id")
      .eq("product_id", productId)
      .in("event_type", ["view_product", "add_to_cart", "purchase"])
      .not("user_id", "is", null)
      .limit(500);

    const userIds = [...new Set((seedEvents ?? []).map((event) => event.user_id).filter(Boolean))] as string[];

    if (userIds.length > 0) {
      const { data: relatedEvents } = await admin
        .from("user_events")
        .select("product_id,event_type")
        .in("user_id", userIds)
        .neq("product_id", productId)
        .in("event_type", ["view_product", "add_to_cart", "purchase"])
        .limit(3000);

      const weights: Record<RecommendationEventType, number> = {
        view_product: 1,
        add_to_cart: 2,
        purchase: 4,
      };

      for (const event of relatedEvents ?? []) {
        const eventType = event.event_type as RecommendationEventType;
        scores.set(event.product_id, (scores.get(event.product_id) ?? 0) + (weights[eventType] ?? 0));
      }
    }

    const { data: currentOrderItems } = await admin
      .from("order_items")
      .select("order_id")
      .eq("product_id", productId)
      .limit(250);

    const orderIds = [...new Set((currentOrderItems ?? []).map((item) => item.order_id))] as string[];

    if (orderIds.length > 0) {
      const { data: paidOrders } = await admin
        .from("orders")
        .select("id")
        .in("id", orderIds)
        .in("status", [...PAID_ORDER_STATUSES]);

      const paidOrderIds = [...new Set((paidOrders ?? []).map((order) => order.id))] as string[];

      if (paidOrderIds.length > 0) {
        const { data: siblingItems } = await admin
          .from("order_items")
          .select("product_id,quantity")
          .in("order_id", paidOrderIds)
          .neq("product_id", productId);

        for (const item of siblingItems ?? []) {
          scores.set(item.product_id, (scores.get(item.product_id) ?? 0) + Math.max(item.quantity ?? 1, 1) * 4);
        }
      }
    }

    const candidateIds = [...scores.keys()];
    if (candidateIds.length === 0) {
      return buildContextualRecommendations([productId], { excludeIds: [productId], limit });
    }

    const products = await fetchProductDisplaysByIds(candidateIds);
    const sorted = sortRecommendationProducts(
      products.filter((product) => product.id !== productId),
      scores,
      limit,
    );

    if (sorted.length >= limit) {
      return sorted;
    }

    const fallback = await buildContextualRecommendations([productId], {
      excludeIds: [productId, ...sorted.map((product) => product.id)],
      limit: limit - sorted.length,
    });

    return [...sorted, ...fallback].slice(0, limit);
  } catch {
    return [];
  }
});

export const getCartUpsellRecommendations = cache(async function getCartUpsellRecommendations(
  productId: string,
  excludeIds: string[] = [],
  limit = 3,
): Promise<ProductDisplay[]> {
  try {
    return await buildContextualRecommendations([productId], {
      excludeIds: [productId, ...excludeIds],
      limit,
    });
  } catch {
    return [];
  }
});

export const getPostPurchaseRecommendations = cache(async function getPostPurchaseRecommendations(
  orderId: string,
  limit = 4,
): Promise<ProductDisplay[]> {
  try {
    const admin = createAdminClient();
    const { data: orderItems } = await admin
      .from("order_items")
      .select("product_id")
      .eq("order_id", orderId);

    const productIds = [...new Set((orderItems ?? []).map((item) => item.product_id))] as string[];
    if (productIds.length === 0) return [];

    return buildContextualRecommendations(productIds, {
      excludeIds: productIds,
      limit,
    });
  } catch {
    return [];
  }
});

export async function recordUserEvent(input: {
  userId?: string | null;
  productId: string;
  eventType: RecommendationEventType;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("user_events").insert({
      user_id: input.userId ?? null,
      product_id: input.productId,
      event_type: input.eventType,
    });
  } catch {}
}

export async function recordPurchaseEventsForOrder(orderId: string) {
  try {
    const admin = createAdminClient();
    const [{ data: order }, { data: items }] = await Promise.all([
      admin.from("orders").select("id,user_id").eq("id", orderId).maybeSingle(),
      admin.from("order_items").select("product_id").eq("order_id", orderId),
    ]);

    if (!order || !items?.length) return;

    await admin.from("user_events").insert(
      items.map((item) => ({
        user_id: order.user_id ?? null,
        product_id: item.product_id,
        event_type: "purchase",
      })),
    );
  } catch {}
}
