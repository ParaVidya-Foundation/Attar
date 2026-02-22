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
    throw err;
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
    throw err;
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
    throw err;
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
    throw err;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const valid = ["created", "pending", "paid", "shipped", "delivered", "failed", "cancelled"];
  if (!valid.includes(status)) {
    return { ok: false, error: "Invalid status" };
  }

  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      serverError("admin actions updateOrderStatus", error);
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch (err) {
    serverError("admin actions updateOrderStatus", err);
    throw err;
  }
}

export async function updateVariantStock(variantId: string, stock: number) {
  const guard = await guardAdmin();
  if (guard) return guard;
  if (stock < 0) {
    return { ok: false, error: "Stock cannot go below 0" };
  }

  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .from("product_variants")
      .update({ stock })
      .eq("id", variantId);

    if (error) {
      serverError("admin actions updateVariantStock", error);
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    serverError("admin actions updateVariantStock", err);
    throw err;
  }
}
