"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";

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

async function guardAdmin(): Promise<{ ok: false; error: string } | null> {
  try {
    assertAdminEnv();
    await assertAdmin();
    return null;
  } catch (err) {
    if (err instanceof NotAuthenticatedError) return { ok: false, error: "Not authenticated" };
    if (err instanceof ForbiddenError || err instanceof ProfileMissingError) return { ok: false, error: "Forbidden" };
    console.error("[admin actions] guardAdmin failed:", err);
    throw err;
  }
}

export async function createProduct(data: ProductFormData) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();
  const slug = data.slug || slugify(data.name);

  try {
    const { error } = await supabase.from("products").insert({
      name: data.name,
      slug,
      description: data.description || null,
      short_description: null,
      category_id: data.category_id || null,
      price: data.price,
      original_price: data.original_price ?? null,
      is_active: data.is_active ?? true,
    });

    if (error) {
      console.error("[admin actions] createProduct Supabase error", { error, slug });
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    console.error("[admin actions] createProduct failed", { error: err, slug: data.slug || slugify(data.name) });
    throw err;
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();
  const slug = data.slug || slugify(data.name);

  try {
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
        is_active: data.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[admin actions] updateProduct Supabase error", { error, id });
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { ok: true };
  } catch (err) {
    console.error("[admin actions] updateProduct failed", { error: err, id });
    throw err;
  }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();
  try {
    const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);

    if (error) {
      console.error("[admin actions] toggleProductActive Supabase error", { error, id, isActive });
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    console.error("[admin actions] toggleProductActive failed", { error: err, id });
    throw err;
  }
}

export async function deleteProduct(id: string) {
  const guard = await guardAdmin();
  if (guard) return guard;
  const supabase = createAdminClient();

  try {
    const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);

    if (error) {
      console.error("[admin actions] deleteProduct Supabase error", { error, id });
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    return { ok: true };
  } catch (err) {
    console.error("[admin actions] deleteProduct failed", { error: err, id });
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
      console.error("[admin actions] updateOrderStatus Supabase error", { error, orderId, status });
      return { ok: false, error: error.message };
    }
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    console.error("[admin actions] updateOrderStatus failed", { error: err, orderId, status });
    throw err;
  }
}
