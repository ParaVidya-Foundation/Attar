import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";

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
  /** Min variant price or product price when no variants */
  min_price?: number;
  /** Sum of variant stock */
  total_stock?: number;
  /** Primary or first image URL */
  image_url?: string | null;
};

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

export type CustomerRow = {
  user_email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
};

export type InventoryRow = {
  variant_id: string;
  product_id: string;
  product_name: string;
  size_ml: number;
  price: number;
  stock: number;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export type DashboardStats = {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
  revenue7Days: number;
  lowStockCount: number;
};

export type SalesAnalytics = {
  ordersLast7Days: { date: string; count: number }[];
  revenueLast7Days: { date: string; amount: number }[];
  topProducts: { productId: string; productName: string; qty: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59.999`;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      productsRes,
      activeProductsRes,
      ordersRes,
      customersRes,
      revenueRes,
      ordersTodayRes,
      revenueTodayRes,
      revenue7DaysRes,
      lowStockRes,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("amount").in("status", ["paid", "shipped", "delivered"]),
      supabase
        .from("orders")
        .select("id")
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("orders")
        .select("amount")
        .in("status", ["paid", "shipped", "delivered"])
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("orders")
        .select("amount")
        .in("status", ["paid", "shipped", "delivered"])
        .gte("created_at", sevenDaysAgo),
      supabase.from("product_variants").select("id").lt("stock", 10),
    ]);

    const totalProducts = productsRes.count ?? 0;
    const activeProducts = activeProductsRes.count ?? 0;
    const totalOrders = ordersRes.count ?? 0;
    const totalCustomers = customersRes.count ?? 0;
    const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0);
    const ordersToday = ordersTodayRes.data?.length ?? 0;
    const revenueToday = (revenueTodayRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0);
    const revenue7Days = (revenue7DaysRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0);
    const lowStockCount = lowStockRes.data?.length ?? 0;

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      ordersToday,
      revenueToday,
      revenue7Days,
      lowStockCount,
    };
  } catch (err) {
    serverError("admin queries getDashboardStats", err);
    throw err;
  }
}

export async function getProducts(page = 1, search?: string): Promise<{ data: ProductRow[]; total: number }> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("products")
      .select("id,name,slug,description,short_description,category_id,price,original_price,is_active,meta_title,meta_description,created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      serverError("admin queries getProducts", error);
      throw error;
    }

    const rows = (products ?? []) as ProductRow[];
    if (rows.length === 0) return { data: rows, total: count ?? 0 };

    const ids = rows.map((p) => p.id);
    const [variantsRes, imagesRes] = await Promise.all([
      supabase.from("product_variants").select("product_id,price,stock").in("product_id", ids),
      supabase.from("product_images").select("product_id,image_url,is_primary").in("product_id", ids).order("is_primary", { ascending: false }),
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
      return {
        ...p,
        min_price: v ? v.minPrice : p.price,
        total_stock: v?.totalStock ?? 0,
        image_url: imageByProduct.get(p.id) ?? null,
      };
    });

    return { data, total: count ?? 0 };
  } catch (err) {
    serverError("admin queries getProducts", err);
    throw err;
  }
}

export async function getOrders(
  page = 1,
  statusFilter?: string,
): Promise<{ data: OrderRow[]; total: number }> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

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

    const { data: orders, error: ordersError, count } = await query;

    if (ordersError) {
      serverError("admin queries getOrders", ordersError);
      throw ordersError;
    }

    if (!orders?.length) {
      return { data: [], total: count ?? 0 };
    }

    const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
    const emailMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id,email").in("id", userIds);
      if (profilesError) {
        serverError("admin queries getOrders profiles", profilesError);
      }
      profiles?.forEach((p: { id: string; email?: string }) => {
        emailMap.set(p.id, p.email ?? "");
      });
    }

    const data: OrderRow[] = orders.map((o) => ({
      ...o,
      user_email: o.email || (o.user_id ? emailMap.get(o.user_id) ?? "" : ""),
    }));

    return { data, total: count ?? 0 };
  } catch (err) {
    serverError("admin queries getOrders", err);
    throw err;
  }
}

export async function getCustomers(): Promise<CustomerRow[]> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("user_id,amount,status,created_at")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (error) {
      serverError("admin queries getCustomers", error);
      throw error;
    }
    if (!orders?.length) return [];

    const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id,email").in("id", userIds);
    if (profilesError) {
      serverError("admin queries getCustomers profiles", profilesError);
    }
    const emailMap = new Map<string, string>();
    profiles?.forEach((p: { id: string; email?: string }) => {
      emailMap.set(p.id, p.email ?? "");
    });

    const agg = new Map<string, { orders: number; spent: number; lastOrder: string | null }>();
    orders.forEach((o) => {
      if (!o.user_id) return;
      const email = emailMap.get(o.user_id) ?? "(no email)";
      const paid = ["paid", "shipped", "delivered"].includes(o.status);
      const curr = agg.get(email) ?? { orders: 0, spent: 0, lastOrder: null };
      curr.orders += 1;
      if (paid) curr.spent += o.amount ?? 0;
      const created = (o as { created_at?: string }).created_at;
      if (created && (!curr.lastOrder || created > curr.lastOrder)) curr.lastOrder = created;
      agg.set(email, curr);
    });

    return [...agg.entries()].map(([user_email, v]) => ({
      user_email,
      total_orders: v.orders,
      total_spent: v.spent,
      last_order_date: v.lastOrder,
    }));
  } catch (err) {
    serverError("admin queries getCustomers", err);
    throw err;
  }
}

export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [ordersRes, topProductsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("created_at,amount,status")
        .gte("created_at", sevenDaysAgo),
      supabase.from("order_items").select("product_id,quantity").then(async ({ data }) => {
        if (!data?.length) return [];
        const agg = new Map<string, number>();
        data.forEach((r) => {
          const k = r.product_id;
          agg.set(k, (agg.get(k) ?? 0) + (r.quantity ?? 0));
        });
        const sorted = [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const ids = sorted.map(([id]) => id);
        const { data: prods } = await supabase.from("products").select("id,name").in("id", ids);
        const map = new Map((prods ?? []).map((p) => [p.id, p.name]));
        return sorted.map(([id, qty]) => ({ productId: id, productName: map.get(id) ?? "Unknown", qty }));
      }),
    ]);

    if (ordersRes.error) {
      serverError("admin queries getSalesAnalytics", ordersRes.error);
      throw ordersRes.error;
    }

    const orders = ordersRes.data ?? [];
    const last7ByDay: Record<string, { count: number; amount: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7ByDay[d.toISOString().slice(0, 10)] = { count: 0, amount: 0 };
    }

    orders.forEach((o) => {
      const d = (o.created_at as string).slice(0, 10);
      if (d in last7ByDay) {
        last7ByDay[d].count += 1;
        if (["paid", "shipped", "delivered"].includes(o.status)) {
          last7ByDay[d].amount += o.amount ?? 0;
        }
      }
    });

    const ordersLast7Days = Object.entries(last7ByDay).map(([date, v]) => ({ date, count: v.count }));
    const revenueLast7Days = Object.entries(last7ByDay).map(([date, v]) => ({ date, amount: v.amount }));
    const topProducts = await topProductsRes;

    return {
      ordersLast7Days,
      revenueLast7Days,
      topProducts,
    };
  } catch (err) {
    serverError("admin queries getSalesAnalytics failed", { error: err });
    throw err;
  }
}

export async function getCategories(): Promise<CategoryRow[]> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug")
      .order("name");

    if (error) {
      serverError("admin queries getCategories", error);
      throw error;
    }
    return (data ?? []) as CategoryRow[];
  } catch (err) {
    serverError("admin queries getCategories failed", { error: err });
    throw err;
  }
}

export async function getInventoryRows(): Promise<InventoryRow[]> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data: variants, error: vErr } = await supabase
      .from("product_variants")
      .select("id,product_id,size_ml,price,stock")
      .order("product_id");

    if (vErr) {
      serverError("admin queries getInventoryRows", vErr);
      throw vErr;
    }
    if (!variants?.length) return [];

    const productIds = [...new Set(variants.map((v) => v.product_id))];
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id,name")
      .in("id", productIds);

    if (pErr) throw pErr;
    const nameMap = new Map((products ?? []).map((p) => [p.id, p.name]));

    return (variants as { id: string; product_id: string; size_ml: number; price: number; stock: number }[]).map(
      (v) => ({
        variant_id: v.id,
        product_id: v.product_id,
        product_name: nameMap.get(v.product_id) ?? "—",
        size_ml: v.size_ml,
        price: v.price,
        stock: v.stock,
      }),
    );
  } catch (err) {
    serverError("admin queries getInventoryRows failed", { error: err });
    throw err;
  }
}

export async function getOrderById(orderId: string): Promise<{
  order: OrderRow & { customerEmail?: string | null };
  items: { product_id: string; variant_id: string | null; quantity: number; price: number; productName: string }[];
} | null> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id,user_id,name,email,phone,status,amount,currency,razorpay_order_id,razorpay_payment_id,created_at")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) return null;

    const { data: items } = await supabase
      .from("order_items")
      .select("product_id,variant_id,quantity,price")
      .eq("order_id", orderId);

    const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
    const { data: prods } = await supabase.from("products").select("id,name").in("id", productIds);
    const nameMap = new Map((prods ?? []).map((p) => [p.id, p.name]));

    let customerEmail = order.email;
    if (order.user_id && !customerEmail) {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", order.user_id).single();
      customerEmail = profile?.email ?? null;
    }

    return {
      order: {
        ...order,
        user_email: order.email || customerEmail || "",
        customerEmail: customerEmail ?? undefined,
      } as OrderRow & { customerEmail?: string | null },
      items: (items ?? []).map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id ?? null,
        quantity: i.quantity ?? 0,
        price: i.price ?? 0,
        productName: nameMap.get(i.product_id) ?? "Unknown",
      })),
    };
  } catch (err) {
    serverError("admin queries getOrderById", err);
    throw err;
  }
}
