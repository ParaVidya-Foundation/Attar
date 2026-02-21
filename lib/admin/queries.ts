import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";

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
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
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

    const [
      productsRes,
      ordersRes,
      customersRes,
      revenueRes,
      ordersTodayRes,
      revenueTodayRes,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("amount").eq("status", "paid"),
      supabase
        .from("orders")
        .select("id")
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("orders")
        .select("amount")
        .eq("status", "paid")
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
    ]);

    const totalProducts = productsRes.count ?? 0;
    const totalOrders = ordersRes.count ?? 0;
    const totalCustomers = customersRes.count ?? 0;
    const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0);
    const ordersToday = ordersTodayRes.data?.length ?? 0;
    const revenueToday = (revenueTodayRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0);

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      ordersToday,
      revenueToday,
    };
  } catch (err) {
    console.error("[admin queries] getDashboardStats failed", { error: err });
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

    const { data, error, count } = await query;

    if (error) {
      console.error("[admin queries] getProducts Supabase error", { error, page, search });
      throw error;
    }

    return {
      data: (data ?? []) as ProductRow[],
      total: count ?? 0,
    };
  } catch (err) {
    console.error("[admin queries] getProducts failed", { error: err, page, search });
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
      console.error("[admin queries] getOrders Supabase error", { error: ordersError, page, statusFilter });
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
        console.error("[admin queries] getOrders profiles fetch error", { error: profilesError });
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
    console.error("[admin queries] getOrders failed", { error: err, page, statusFilter });
    throw err;
  }
}

export async function getCustomers(): Promise<CustomerRow[]> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("user_id,amount,status");

    if (error) {
      console.error("[admin queries] getCustomers Supabase error", { error });
      throw error;
    }
    if (!orders?.length) return [];

    const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id,email").in("id", userIds);
    if (profilesError) {
      console.error("[admin queries] getCustomers profiles fetch error", { error: profilesError });
    }
    const emailMap = new Map<string, string>();
    profiles?.forEach((p: { id: string; email?: string }) => {
      emailMap.set(p.id, p.email ?? "");
    });

    const agg = new Map<string, { orders: number; spent: number }>();
    orders.forEach((o) => {
      if (!o.user_id) return;
      const email = emailMap.get(o.user_id) ?? "(no email)";
      const paid = ["paid", "shipped", "delivered"].includes(o.status);
      const curr = agg.get(email) ?? { orders: 0, spent: 0 };
      curr.orders += 1;
      if (paid) curr.spent += o.amount ?? 0;
      agg.set(email, curr);
    });

    return [...agg.entries()].map(([user_email, v]) => ({
      user_email,
      total_orders: v.orders,
      total_spent: v.spent,
    }));
  } catch (err) {
    console.error("[admin queries] getCustomers failed", { error: err });
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
      console.error("[admin queries] getSalesAnalytics orders error", { error: ordersRes.error });
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
    console.error("[admin queries] getSalesAnalytics failed", { error: err });
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
      console.error("[admin queries] getCategories Supabase error", { error });
      throw error;
    }
    return (data ?? []) as CategoryRow[];
  } catch (err) {
    console.error("[admin queries] getCategories failed", { error: err });
    throw err;
  }
}
