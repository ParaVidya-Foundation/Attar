"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

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
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createProduct(data: ProductFormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const slug = data.slug || slugify(data.name);

  const { error } = await supabase.from("products").insert({
    name: data.name,
    slug,
    description: data.description || null,
    short_description: null,
    category_id: data.category_id || null,
    price: data.price,
    original_price: data.original_price ?? null,
    stock: data.stock ?? 0,
    is_active: data.is_active ?? true,
    image_url: data.image_url || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateProduct(id: string, data: ProductFormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const slug = data.slug || slugify(data.name);

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug,
      description: data.description || null,
      short_description: null,
      category_id: data.category_id || null,
      price: data.price,
      original_price: data.original_price ?? null,
      stock: data.stock ?? 0,
      is_active: data.is_active ?? true,
      image_url: data.image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  const valid = ["created", "pending", "paid", "shipped", "delivered", "failed", "cancelled"];
  if (!valid.includes(status)) {
    return { ok: false, error: "Invalid status" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/orders");
  return { ok: true };
}
