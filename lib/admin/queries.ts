import { createAdminClient } from "@/lib/supabase/admin";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  price: number;
  original_price: number | null;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  total_amount: number;
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
    supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("orders").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "paid")
      .is("deleted_at", null),
    supabase
      .from("orders")
      .select("id")
      .gte("created_at", todayStart)
      .lt("created_at", todayEnd)
      .is("deleted_at", null),
    supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "paid")
      .gte("created_at", todayStart)
      .lt("created_at", todayEnd)
      .is("deleted_at", null),
  ]);

  const totalProducts = productsRes.count ?? 0;
  const totalOrders = ordersRes.count ?? 0;
  const totalCustomers = customersRes.count ?? 0;
  const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);
  const ordersToday = ordersTodayRes.data?.length ?? 0;
  const revenueToday = (revenueTodayRes.data ?? []).reduce((s, o) => s + (o.total_amount ?? 0), 0);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    ordersToday,
    revenueToday,
  };
}

export async function getProducts(page = 1, search?: string): Promise<{ data: ProductRow[]; total: number }> {
  const supabase = createAdminClient();
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("id,name,slug,description,short_description,category_id,price,original_price,stock,is_active,image_url,created_at", {
      count: "exact",
    })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin queries] getProducts:", error);
    return { data: [], total: 0 };
  }

  return {
    data: (data ?? []) as ProductRow[],
    total: count ?? 0,
  };
}

export async function getOrders(
  page = 1,
  statusFilter?: string,
): Promise<{ data: OrderRow[]; total: number }> {
  const supabase = createAdminClient();
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("orders")
    .select(
      "id,user_id,name,email,phone,status,total_amount,currency,razorpay_order_id,razorpay_payment_id,created_at",
      { count: "exact" },
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: orders, error: ordersError, count } = await query;

  if (ordersError || !orders?.length) {
    return { data: [], total: count ?? 0 };
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

  return { data, total: count ?? 0 };
}

export async function getCustomers(): Promise<CustomerRow[]> {
  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("user_id,total_amount,status")
    .is("deleted_at", null);

  if (error || !orders?.length) return [];

  const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
  const { data: profiles } = await supabase.from("profiles").select("id,email").in("id", userIds);
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
    if (paid) curr.spent += o.total_amount ?? 0;
    agg.set(email, curr);
  });

  return [...agg.entries()].map(([user_email, v]) => ({
    user_email,
    total_orders: v.orders,
    total_spent: v.spent,
  }));
}

export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  const supabase = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [ordersRes, topProductsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("created_at,total_amount,status")
      .gte("created_at", sevenDaysAgo)
      .is("deleted_at", null),
    supabase.from("order_items").select("product_id,qty").then(async ({ data }) => {
      if (!data?.length) return [];
      const agg = new Map<string, number>();
      data.forEach((r) => {
        const k = r.product_id;
        agg.set(k, (agg.get(k) ?? 0) + (r.qty ?? 0));
      });
      const sorted = [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      const ids = sorted.map(([id]) => id);
      const { data: prods } = await supabase.from("products").select("id,name").in("id", ids);
      const map = new Map((prods ?? []).map((p) => [p.id, p.name]));
      return sorted.map(([id, qty]) => ({ productId: id, productName: map.get(id) ?? "Unknown", qty }));
    }),
  ]);

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
        last7ByDay[d].amount += o.total_amount ?? 0;
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
}

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug")
    .is("deleted_at", null)
    .order("name");

  if (error) return [];
  return (data ?? []) as CategoryRow[];
}
