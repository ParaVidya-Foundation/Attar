import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";
import { invalidateAnalyticsCache } from "./cache";
import type { ServiceResult } from "./types";
import { PAID_STATUSES, success, fail } from "./types";

export type OrderRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  user_email: string;
};

export type OrderDetail = OrderRow & {
  customerEmail?: string | null;
  items: { product_id: string; variant_id: string | null; quantity: number; price: number; productName: string }[];
};

const VALID_STATUSES = ["created", "pending", "paid", "shipped", "delivered", "failed", "cancelled", "expired"] as const;

export async function getOrders(
  page: number,
  statusFilter?: string,
  pageSize = 20,
): Promise<ServiceResult<{ data: OrderRow[]; total: number }>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const safePage = Math.max(1, page);
    const safeSize = Math.min(Math.max(1, pageSize), 100);
    const from = (safePage - 1) * safeSize;
    const to = from + safeSize - 1;

    let query = supabase
      .from("orders")
      .select(
        "id,user_id,name,email,phone,status,amount,currency,razorpay_order_id,razorpay_payment_id,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      serverError("orders.service getOrders", error);
      return fail(error.message);
    }

    if (!orders?.length) {
      return success({ data: [], total: count ?? 0 });
    }

    const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
    const emailMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id,email").in("id", userIds);
      profiles?.forEach((p: { id: string; email?: string }) => {
        emailMap.set(p.id, p.email ?? "");
      });
    }

    const data: OrderRow[] = orders.map((o) => ({
      ...o,
      user_email: o.email || (o.user_id ? emailMap.get(o.user_id) ?? "" : ""),
    }));

    return success({ data, total: count ?? 0 });
  } catch (err) {
    serverError("orders.service getOrders", err);
    return fail("Failed to fetch orders");
  }
}

export async function getOrderById(orderId: string): Promise<ServiceResult<OrderDetail | null>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id,user_id,name,email,phone,status,amount,currency,razorpay_order_id,razorpay_payment_id,created_at")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) return success(null);

    const [{ data: items }, { data: profile }] = await Promise.all([
      supabase.from("order_items").select("product_id,variant_id,quantity,price").eq("order_id", orderId),
      order.user_id && !order.email
        ? supabase.from("profiles").select("email").eq("id", order.user_id).single()
        : Promise.resolve({ data: null }),
    ]);

    const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
    const { data: prods } = productIds.length > 0
      ? await supabase.from("products").select("id,name").in("id", productIds)
      : { data: [] };
    const nameMap = new Map((prods ?? []).map((p) => [p.id, p.name]));

    const customerEmail = order.email || profile?.email || null;

    return success({
      ...order,
      user_email: customerEmail || "",
      customerEmail,
      items: (items ?? []).map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id ?? null,
        quantity: i.quantity ?? 0,
        price: i.price ?? 0,
        productName: nameMap.get(i.product_id) ?? "Unknown",
      })),
    });
  } catch (err) {
    serverError("orders.service getOrderById", err);
    return fail("Failed to fetch order");
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ServiceResult> {
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return fail("Invalid status");
  }

  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: current } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (!current) return fail("Order not found");

    if (status === "cancelled" && PAID_STATUSES.includes(current.status as typeof PAID_STATUSES[number])) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("variant_id,quantity")
        .eq("order_id", orderId);

      for (const item of orderItems ?? []) {
        if (item.variant_id) {
          await supabase.rpc("increment_variant_stock", {
            p_variant_id: item.variant_id,
            p_qty: item.quantity,
          });
        }
      }
    }

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      serverError("orders.service updateOrderStatus", error);
      return fail(error.message);
    }

    await invalidateAnalyticsCache();
    return success(undefined);
  } catch (err) {
    serverError("orders.service updateOrderStatus", err);
    return fail("Failed to update order status");
  }
}
