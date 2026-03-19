"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { serverError } from "@/lib/security/logger";

export type ProductVariantInput = {
  size_ml: number;
  price: number;
  stock: number;
};

export type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  is_active: boolean;
  image_url: string;
  variants?: ProductVariantInput[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function guardAdmin(): Promise<{ ok: false; error: string } | null> {
  try {
    assertAdminEnv();
    await assertAdmin();
    return null;
  } catch (err) {
    if (err instanceof NotAuthenticatedError) return { ok: false, error: "Not authenticated" };
    if (err instanceof ForbiddenError || err instanceof ProfileMissingError) return { ok: false, error: "Forbidden" };
    serverError("admin actions guardAdmin", err);
    throw err;
  }
}

/** FormData-based action for ProductForm — use as form action with useFormState (no function passed to client). */
export async function productFormAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const productId = (formData.get("productId") as string)?.trim() || null;
  const variantsRaw = formData.get("variants") as string | null;
  let variants: ProductVariantInput[] = [];
  if (variantsRaw) {
    try {
      variants = JSON.parse(variantsRaw) as ProductVariantInput[];
    } catch {
      variants = [];
    }
  }
  const data: ProductFormData = {
    name: (formData.get("name") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    category_id: (formData.get("category_id") as string) || null,
    price: Number(formData.get("price")) || 0,
    original_price: formData.get("original_price") ? Number(formData.get("original_price")) : null,
    stock: Number(formData.get("stock")) || 0,
    is_active: formData.get("is_active") === "on",
    image_url: (formData.get("image_url") as string) ?? "",
    variants: variants.filter((v) => v.size_ml > 0),
  };
  if (productId) return updateProduct(productId, data);
  return createProduct(data);
}

export async function createProduct(data: ProductFormData) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();
  const slug = data.slug || slugify(data.name);
  const variants = data.variants?.filter((v) => v.size_ml > 0) ?? [];
  const productPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : data.price;

  try {
    const { data: inserted, error: insertErr } = await supabase
      .from("products")
      .insert({
        name: data.name,
        slug,
        description: data.description || null,
        short_description: null,
        category_id: data.category_id || null,
        price: productPrice,
        original_price: data.original_price ?? null,
        is_active: data.is_active ?? true,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      serverError("admin actions createProduct", insertErr);
      return { ok: false, error: insertErr?.message ?? "Insert failed" };
    }

    if (variants.length > 0) {
      const { error: varErr } = await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: inserted.id,
          size_ml: v.size_ml,
          price: v.price,
          stock: Math.max(0, v.stock),
        })),
      );
      if (varErr) {
        serverError("admin actions createProduct variants", varErr);
        return { ok: false, error: varErr.message };
      }
    }

    if (data.image_url?.trim()) {
      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: inserted.id,
        image_url: data.image_url.trim(),
        is_primary: true,
        sort_order: 0,
      });
      if (imgErr) serverError("admin actions createProduct image", imgErr);
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[admin] Minimum 2 product images recommended; only 1 provided.");
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (err) {
    serverError("admin actions createProduct", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();
  const slug = data.slug || slugify(data.name);
  const variants = data.variants?.filter((v) => v.size_ml > 0) ?? [];
  const productPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : data.price;

  try {
    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        slug,
        description: data.description || null,
        short_description: null,
        category_id: data.category_id || null,
        price: productPrice,
        original_price: data.original_price ?? null,
        is_active: data.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      serverError("admin actions updateProduct", error);
      return { ok: false, error: error.message };
    }

    const { data: existingImages } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", id);
    if (existingImages && existingImages.length < 2 && typeof console !== "undefined" && console.warn) {
      console.warn("[admin] Minimum 2 product images recommended; product has fewer than 2.");
    }

    const { error: delErr } = await supabase.from("product_variants").delete().eq("product_id", id);
    if (delErr) {
      serverError("admin actions updateProduct delete variants", delErr);
      return { ok: false, error: delErr.message };
    }
    if (variants.length > 0) {
      const { error: varErr } = await supabase.from("product_variants").insert(
        variants.map((v) => ({
          product_id: id,
          size_ml: v.size_ml,
          price: v.price,
          stock: Math.max(0, v.stock),
        })),
      );
      if (varErr) {
        serverError("admin actions updateProduct variants", varErr);
        return { ok: false, error: varErr.message };
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/products/${id}`);
    return { ok: true };
  } catch (err) {
    serverError("admin actions updateProduct", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update product" };
  }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();
  try {
    if (isActive) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id", id)
        .limit(1);
      if (!variants?.length) {
        return { ok: false, error: "Cannot activate product without variants" };
      }
    }

    const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);

    if (error) {
      serverError("admin actions toggleProductActive", error);
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    serverError("admin actions toggleProductActive", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to toggle product" };
  }
}

/** FormData-based action for toggle (use as form action with useFormState for refresh). */
export async function toggleProductActiveForm(
  _prev: { done?: boolean } | null,
  formData: FormData,
): Promise<{ done: boolean }> {
  const id = (formData.get("id") as string)?.trim();
  const current = formData.get("current") === "true";
  if (!id) return { done: false };
  await toggleProductActive(id, !current);
  return { done: true };
}

/** FormData-based action for delete (use as form action; for useFormState). */
export async function deleteProductForm(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return { ok: false, error: "Missing id" };
  return deleteProduct(id);
}

export async function deleteProduct(id: string) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();

  try {
    const { data: orderItems, error: checkErr } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (checkErr) {
      serverError("admin actions deleteProduct check orders", checkErr);
      return { ok: false, error: "Could not verify orders" };
    }
    if (orderItems?.length) {
      return { ok: false, error: "Cannot delete product that has orders" };
    }

    const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);

    if (error) {
      serverError("admin actions deleteProduct", error);
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    return { ok: true };
  } catch (err) {
    serverError("admin actions deleteProduct", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete product" };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const guard = await guardAdmin();
  if (guard) return guard;

  const { ordersService } = await import("@/lib/admin/services");
  const result = await ordersService.updateOrderStatus(orderId, status);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateVariantStock(variantId: string, stock: number) {
  const guard = await guardAdmin();
  if (guard) return guard;

  const { inventoryService } = await import("@/lib/admin/services");
  const result = await inventoryService.updateVariantStock(variantId, stock);

  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { ok: true };
}

// ——— Blog (admin only) ———

import { z } from "zod";
import { postsService } from "@/lib/blog/services";

const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  cover_image: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  author_name: z.string().optional(),
  reading_time: z.number().int().min(0).nullable().optional(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  published_at: z.string().nullable().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

export async function blogPostFormAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const guard = await guardAdmin();
  if (guard) return guard;

  const postId = (formData.get("postId") as string)?.trim() || null;
  let tagIds: string[] = [];
  try {
    tagIds = JSON.parse((formData.get("tag_ids") as string) ?? "[]") as string[];
  } catch {
    tagIds = [];
  }

  const rawStatus = (formData.get("status") as string) ?? "draft";
  const publishedAtRaw = (formData.get("published_at") as string)?.trim() || null;

  const parsed = blogPostSchema.safeParse({
    title: (formData.get("title") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    excerpt: (formData.get("excerpt") as string) ?? "",
    content: (formData.get("content") as string) ?? "",
    cover_image: (formData.get("cover_image") as string) ?? "",
    category_id: (formData.get("category_id") as string) || null,
    author_name: (formData.get("author_name") as string) ?? "",
    reading_time: formData.get("reading_time") ? Number(formData.get("reading_time")) : null,
    status: rawStatus === "published" ? "published" : rawStatus === "scheduled" ? "scheduled" : "draft",
    published_at: publishedAtRaw,
    tag_ids: Array.isArray(tagIds) ? tagIds : [],
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  const data = parsed.data;

  if (data.status === "published" && !data.content?.trim()) {
    return { ok: false, error: "Content is required to publish" };
  }

  const input = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image: data.cover_image,
    category_id: data.category_id ?? null,
    author_name: data.author_name,
    reading_time: data.reading_time ?? null,
    status: data.status as "draft" | "published" | "scheduled",
    published_at: data.published_at ?? null,
    tag_ids: data.tag_ids ?? [],
  };

  let result;
  if (postId) {
    result = await postsService.updatePost(postId, input);
  } else {
    result = await postsService.createPost(input);
  }

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  return { ok: true };
}

export async function deleteBlogPost(id: string) {
  const guard = await guardAdmin();
  if (guard) return guard;

  const result = await postsService.deletePost(id);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  return { ok: true };
}
