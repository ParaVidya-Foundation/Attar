import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";
import type { ServiceResult } from "./types";
import { success, fail } from "./types";

export type InventoryRow = {
  variant_id: string;
  product_id: string;
  product_name: string;
  size_ml: number;
  price: number;
  stock: number;
};

export async function getInventoryRows(
  page = 1,
  pageSize = 100,
): Promise<ServiceResult<{ data: InventoryRow[]; total: number }>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const safePage = Math.max(1, page);
    const safeSize = Math.min(Math.max(1, pageSize), 200);
    const from = (safePage - 1) * safeSize;
    const to = from + safeSize - 1;

    const { data: variants, error: vErr, count } = await supabase
      .from("product_variants")
      .select("id,product_id,size_ml,price,stock", { count: "exact" })
      .order("product_id")
      .range(from, to);

    if (vErr) {
      serverError("inventory.service getInventoryRows", vErr);
      return fail(vErr.message);
    }
    if (!variants?.length) return success({ data: [], total: count ?? 0 });

    const productIds = [...new Set(variants.map((v) => v.product_id))];
    const { data: products } = await supabase
      .from("products")
      .select("id,name")
      .in("id", productIds);

    const nameMap = new Map((products ?? []).map((p) => [p.id, p.name]));

    const data: InventoryRow[] = variants.map((v) => ({
      variant_id: v.id,
      product_id: v.product_id,
      product_name: nameMap.get(v.product_id) ?? "—",
      size_ml: v.size_ml,
      price: v.price,
      stock: v.stock,
    }));

    return success({ data, total: count ?? 0 });
  } catch (err) {
    serverError("inventory.service getInventoryRows", err);
    return fail("Failed to fetch inventory");
  }
}

export async function updateVariantStock(
  variantId: string,
  stock: number,
): Promise<ServiceResult> {
  if (!Number.isInteger(stock) || stock < 0) {
    return fail("Stock must be a non-negative integer");
  }

  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("product_variants")
      .update({ stock })
      .eq("id", variantId);

    if (error) {
      serverError("inventory.service updateVariantStock", error);
      return fail(error.message);
    }
    return success(undefined);
  } catch (err) {
    serverError("inventory.service updateVariantStock", err);
    return fail("Failed to update stock");
  }
}

export async function decrementStockForOrder(orderId: string): Promise<ServiceResult<number>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: items } = await supabase
      .from("order_items")
      .select("variant_id,quantity")
      .eq("order_id", orderId);

    if (!items?.length) return success(0);

    let decremented = 0;
    for (const item of items) {
      if (!item.variant_id) continue;
      try {
        await supabase.rpc("decrement_variant_stock", {
          p_variant_id: item.variant_id,
          p_qty: item.quantity,
        });
        decremented++;
      } catch (err) {
        serverError("inventory.service decrementStockForOrder item", err);
      }
    }
    return success(decremented);
  } catch (err) {
    serverError("inventory.service decrementStockForOrder", err);
    return fail("Failed to decrement stock");
  }
}

export async function restoreStockForOrder(orderId: string): Promise<ServiceResult<number>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: items } = await supabase
      .from("order_items")
      .select("variant_id,quantity")
      .eq("order_id", orderId);

    if (!items?.length) return success(0);

    let restored = 0;
    for (const item of items) {
      if (!item.variant_id) continue;
      try {
        await supabase.rpc("increment_variant_stock", {
          p_variant_id: item.variant_id,
          p_qty: item.quantity,
        });
        restored++;
      } catch (err) {
        serverError("inventory.service restoreStockForOrder item", err);
      }
    }
    return success(restored);
  } catch (err) {
    serverError("inventory.service restoreStockForOrder", err);
    return fail("Failed to restore stock");
  }
}
