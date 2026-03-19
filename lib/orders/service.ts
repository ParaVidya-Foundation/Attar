import "server-only";

import { cache } from "react";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import type { Product, ProductDisplay, ProductImage, ProductVariant } from "@/types/product";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

const orderIdSchema = z.string().uuid();

const PAID_ORDER_STATUSES = ["paid", "shipped", "delivered"] as const;

const PRODUCT_COLUMNS =
  "id,name,slug,description,short_description,price,original_price,is_active,featured,category_id,meta_title,meta_description,created_at,updated_at";
const PRODUCT_IMAGE_COLUMNS = "id,product_id,image_url,is_primary,sort_order";
const PRODUCT_VARIANT_COLUMNS = "id,product_id,size_ml,price,stock,sku";
const CATEGORY_COLUMNS = "id,slug";

type OrderSuccessItem = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantSizeMl: number | null;
  quantity: number;
  unitPricePaise: number;
  categoryId: string | null;
};

export type OrderSuccessData = {
  orderId: string;
  createdAt: string;
  status: string;
  paymentStatus: "Paid" | "Pending";
  amountPaise: number;
  currency: string;

  customer: {
    name: string | null;
    email: string;
    phone: string | null;
  };

  address?: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
  };

  items: OrderSuccessItem[];

  purchasedProductIds: string[];
  categoryIds: string[];

  // UI helpers (avoid exposing any payment IDs).
  trackHref: string;
};

function formatNullableText(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const trimmed = s.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pickPaymentStatus(status: string): "Paid" | "Pending" {
  return PAID_ORDER_STATUSES.includes(status as (typeof PAID_ORDER_STATUSES)[number]) ? "Paid" : "Pending";
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

  // If a product has no images, we still return at least one URL (ProductCard handles placeholders).
  if (cleaned.length === 0) return [{ url: PLACEHOLDER_IMAGE_URL }];

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

function pickPrice(productPrice: number, variants: ProductVariant[]): number {
  if (!variants?.length) return productPrice;
  return Math.min(...variants.map((variant) => variant.price));
}

function toProductDisplay(
  row: Product & {
    product_images?: (Pick<ProductImage, "id" | "product_id" | "image_url" | "is_primary" | "sort_order">)[]; // eslint-disable-line
    product_variants?: ProductVariant[];
  },
  categorySlug: string | null,
): ProductDisplay {
  const variants = row.product_variants ?? [];
  const rawImages = row.product_images ?? [];
  const images = sortImages(
    rawImages.map((img) => ({
      image_url: img.image_url,
      is_primary: img.is_primary,
      sort_order: img.sort_order,
    })),
  );

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    short_description: row.short_description ?? null,
    price: pickPrice(row.price, variants),
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

async function fetchProductDisplaysByIds(ids: string[]): Promise<ProductDisplay[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const admin = createAdminClient();

  const { data: products, error: productsErr } = await admin
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("id", uniqueIds)
    .eq("is_active", true);

  if (productsErr) return [];
  if (!products?.length) return [];

  const productIds = (products as Product[]).map((p) => p.id);
  const categoryIds = [...new Set((products as Product[]).map((p) => p.category_id).filter(Boolean))] as string[];

  const [imagesRes, variantsRes, categoriesRes] = await Promise.all([
    admin
      .from("product_images")
      .select(PRODUCT_IMAGE_COLUMNS)
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
    admin.from("product_variants").select(PRODUCT_VARIANT_COLUMNS).in("product_id", productIds),
    categoryIds.length > 0
      ? admin.from("categories").select(CATEGORY_COLUMNS).in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (imagesRes.error) return [];
  if (variantsRes.error) return [];

  const categorySlugById = new Map<string, string>();
  for (const category of categoriesRes.data ?? []) {
    categorySlugById.set(category.id, category.slug);
  }

  type ProductRow = Product & {
    product_images?: (Pick<ProductImage, "id" | "product_id" | "image_url" | "is_primary" | "sort_order">)[];
    product_variants?: ProductVariant[];
  };

  const imagesByProduct = new Map<string, ProductRow["product_images"]>();
  for (const image of (imagesRes.data ?? []) as ProductImage[]) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image);
    imagesByProduct.set(image.product_id, list);
  }

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const variant of (variantsRes.data ?? []) as ProductVariant[]) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  const rows = (products as Product[]).map((p) => ({
    ...(p as ProductRow),
    product_images: imagesByProduct.get(p.id) ?? [],
    product_variants: variantsByProduct.get(p.id) ?? [],
  })) as ProductRow[];

  return rows.map((row) => toProductDisplay(row, row.category_id ? categorySlugById.get(row.category_id) ?? null : null));
}

const getOrderByIdCached = cache(async (orderId: string, viewerUserId: string | null): Promise<OrderSuccessData | null> => {
  try {
    const admin = createAdminClient();

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select(
        "id,user_id,name,email,phone,status,amount,currency,created_at,address_line1,address_line2,city,state,pincode,country",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) return null;

    const orderUserId = order.user_id as string | null;
    const isOwner = Boolean(orderUserId && viewerUserId && orderUserId === viewerUserId);
    const isGuestOrder = !orderUserId;

    // Security gate: allow if user owns the order OR the order is a guest order (user_id is null).
    if (orderUserId && !isOwner) return null;
    if (!isOwner && !isGuestOrder) return null;

    const { data: rawItems } = await admin
      .from("order_items")
      .select("id,product_id,variant_id,quantity,price")
      .eq("order_id", orderId);

    const items = rawItems ?? [];
    if (items.length === 0) {
      const paymentStatus = pickPaymentStatus(order.status);
      return {
        orderId,
        createdAt: order.created_at,
        status: order.status,
        paymentStatus,
        amountPaise: order.amount,
        currency: order.currency ?? "INR",
        customer: {
          name: formatNullableText(order.name),
          email: String(order.email ?? ""),
          phone: formatNullableText(order.phone),
        },
        address:
          order.address_line1 || order.city || order.state || order.pincode || order.country
            ? {
                line1: formatNullableText(order.address_line1),
                line2: formatNullableText(order.address_line2),
                city: formatNullableText(order.city),
                state: formatNullableText(order.state),
                pincode: formatNullableText(order.pincode),
                country: formatNullableText(order.country),
              }
            : undefined,
        items: [],
        purchasedProductIds: [],
        categoryIds: [],
        trackHref:
          orderUserId && isOwner
            ? `/account/orders/${orderId}`
            : `https://wa.me/919311336643?text=${encodeURIComponent(`Hello, I'd like to track my order ${orderId}.`)}`,
      };
    }

    const variantIds = [...new Set(items.map((i: any) => i.variant_id).filter(Boolean))] as string[];
    const productIds = [...new Set(items.map((i: any) => i.product_id).filter(Boolean))] as string[];

    const { data: variantsRes } = await admin
      .from("product_variants")
      .select("id,size_ml,product_id")
      .in("id", variantIds);

    const { data: productsRes } = await admin
      .from("products")
      .select("id,name,slug,category_id")
      .in("id", productIds);

    const variantsById = new Map<string, { size_ml: number; product_id: string }>();
    for (const v of (variantsRes ?? []) as any[]) {
      variantsById.set(v.id, { size_ml: v.size_ml, product_id: v.product_id });
    }

    const productsById = new Map<string, { name: string; slug: string; category_id: string | null }>();
    for (const p of (productsRes ?? []) as any[]) {
      productsById.set(p.id, { name: p.name, slug: p.slug, category_id: p.category_id ?? null });
    }

    const mappedItems: OrderSuccessItem[] = items.map((i: any) => {
      const variant = variantsById.get(i.variant_id);
      const product = productsById.get(i.product_id);
      return {
        productId: i.product_id,
        productName: product?.name ?? "",
        productSlug: product?.slug ?? "",
        variantId: i.variant_id,
        variantSizeMl: typeof variant?.size_ml === "number" ? variant.size_ml : null,
        quantity: Number(i.quantity ?? 0),
        unitPricePaise: Number(i.price ?? 0),
        categoryId: product?.category_id ?? null,
      };
    });

    const purchasedProductIds = [...new Set(mappedItems.map((i) => i.productId))];
    const categoryIds = [...new Set(mappedItems.map((i) => i.categoryId).filter((id) => Boolean(id)))] as string[];

    const paymentStatus = pickPaymentStatus(order.status);

    const trackHref =
      orderUserId && isOwner
        ? `/account/orders/${orderId}`
        : `https://wa.me/919311336643?text=${encodeURIComponent(`Hello, I'd like to track my order ${orderId}.`)}`;

    const address =
      order.address_line1 || order.city || order.state || order.pincode || order.country
        ? {
            line1: formatNullableText(order.address_line1),
            line2: formatNullableText(order.address_line2),
            city: formatNullableText(order.city),
            state: formatNullableText(order.state),
            pincode: formatNullableText(order.pincode),
            country: formatNullableText(order.country),
          }
        : undefined;

    return {
      orderId,
      createdAt: order.created_at,
      status: order.status,
      paymentStatus,
      amountPaise: order.amount,
      currency: order.currency ?? "INR",
      customer: {
        name: formatNullableText(order.name),
        email: String(order.email ?? ""),
        phone: formatNullableText(order.phone),
      },
      address,
      items: mappedItems,
      purchasedProductIds,
      categoryIds,
      trackHref,
    };
  } catch {
    return null;
  }
});

export async function getOrderById(orderId: string): Promise<OrderSuccessData | null> {
  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) return null;

  const user = await getUser();
  const viewerUserId = user?.id ?? null;
  return getOrderByIdCached(parsed.data, viewerUserId);
}

const getRecommendedProductsCached = cache(
  async (categoryIds: string[], purchasedProductIds: string[], limit: number): Promise<ProductDisplay[]> => {
    try {
      const admin = createAdminClient();

      const paidStatuses = [...PAID_ORDER_STATUSES];
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: categoryCandidateRows } = categoryIds.length
        ? await admin.from("products").select("id").in("category_id", categoryIds).eq("is_active", true).limit(120)
        : { data: [] as { id: string }[] };

      const candidateIdsBase = (categoryCandidateRows ?? []).map((r) => r.id) as string[];

      const candidateIdsFiltered = [...new Set(candidateIdsBase.filter((id) => !purchasedProductIds.includes(id)))];

      // If we couldn't infer candidates from category, fall back to "active products excluding purchased".
      const candidateIds =
        candidateIdsFiltered.length > 0
          ? candidateIdsFiltered
          : (
              await admin
                .from("products")
                .select("id")
                .eq("is_active", true)
                .limit(180)
            ).data?.map((r: any) => r.id).filter((id: string) => !purchasedProductIds.includes(id)) ?? [];

      const topCandidateIds = candidateIds.slice(0, 80);
      if (topCandidateIds.length === 0) return [];

      const { data: paidOrderIds } = await admin
        .from("orders")
        .select("id")
        .in("status", paidStatuses)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(6000);

      const orderIds = (paidOrderIds ?? []).map((o: any) => o.id) as string[];

      if (orderIds.length === 0) {
        // Last-30-days has no sales; use recency within candidate pool.
        const { data: recents } = await admin
          .from("products")
          .select("id")
          .in("id", topCandidateIds)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(limit);

        const ids = (recents ?? []).map((r: any) => r.id) as string[];
        return await fetchProductDisplaysByIds(ids);
      }

      const { data: salesRows } = await admin
        .from("order_items")
        .select("product_id,quantity")
        .in("order_id", orderIds)
        .in("product_id", topCandidateIds);

      const qtyByProduct = new Map<string, number>();
      for (const row of (salesRows ?? []) as any[]) {
        const pid = row.product_id as string;
        const qty = Number(row.quantity ?? 1);
        qtyByProduct.set(pid, (qtyByProduct.get(pid) ?? 0) + Math.max(qty, 0));
      }

      // Sort by sales qty; stable by product id to avoid random ordering for ties.
      const sortedIds = [...qtyByProduct.entries()]
        .sort((a, b) => (b[1] - a[1] !== 0 ? b[1] - a[1] : a[0].localeCompare(b[0])))
        .map(([pid]) => pid);

      const finalIds =
        sortedIds.length > 0
          ? sortedIds.slice(0, limit)
          : topCandidateIds.slice(0, limit);

      return await fetchProductDisplaysByIds(finalIds);
    } catch {
      return [];
    }
  },
);

export async function getRecommendedProducts(input: {
  categoryIds: string[];
  purchasedProductIds: string[];
  limit?: number;
}): Promise<ProductDisplay[]> {
  const limit = input.limit ?? 6;
  return getRecommendedProductsCached(input.categoryIds, input.purchasedProductIds, limit);
}

