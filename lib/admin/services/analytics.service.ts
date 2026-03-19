import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";
import { cacheGet, cacheSet } from "@/lib/redis";
import type { ServiceResult } from "./types";
import { PAID_STATUSES, success, fail } from "./types";

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

const ANALYTICS_CACHE_KEY = "admin:analytics";
const STATS_CACHE_KEY = "admin:stats";
const CACHE_TTL = 300; // 5 minutes

export async function getDashboardStats(): Promise<ServiceResult<DashboardStats>> {
  try {
    const cached = await cacheGet<DashboardStats>(STATS_CACHE_KEY);
    if (cached) return success(cached);

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
      supabase
        .from("orders")
        .select("amount")
        .in("status", [...PAID_STATUSES]),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("orders")
        .select("amount")
        .in("status", [...PAID_STATUSES])
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("orders")
        .select("amount")
        .in("status", [...PAID_STATUSES])
        .gte("created_at", sevenDaysAgo),
      supabase.from("product_variants").select("id", { count: "exact", head: true }).lt("stock", 10),
    ]);

    const stats: DashboardStats = {
      totalProducts: productsRes.count ?? 0,
      activeProducts: activeProductsRes.count ?? 0,
      totalOrders: ordersRes.count ?? 0,
      totalCustomers: customersRes.count ?? 0,
      totalRevenue: (revenueRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0),
      ordersToday: ordersTodayRes.count ?? 0,
      revenueToday: (revenueTodayRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0),
      revenue7Days: (revenue7DaysRes.data ?? []).reduce((s, o) => s + (o.amount ?? 0), 0),
      lowStockCount: lowStockRes.count ?? 0,
    };

    await cacheSet(STATS_CACHE_KEY, JSON.stringify(stats), CACHE_TTL);
    return success(stats);
  } catch (err) {
    serverError("analytics.service getDashboardStats", err);
    return fail("Failed to fetch dashboard stats");
  }
}

export async function getSalesAnalytics(): Promise<ServiceResult<SalesAnalytics>> {
  try {
    const cached = await cacheGet<SalesAnalytics>(ANALYTICS_CACHE_KEY);
    if (cached) return success(cached);

    assertAdminEnv();
    const supabase = createAdminClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentOrders, error: ordersErr } = await supabase
      .from("orders")
      .select("id,created_at,amount,status")
      .gte("created_at", sevenDaysAgo);

    if (ordersErr) {
      serverError("analytics.service getSalesAnalytics orders", ordersErr);
      return fail(ordersErr.message);
    }

    const orders = recentOrders ?? [];
    const paidOrderIds = orders
      .filter((o) => PAID_STATUSES.includes(o.status as typeof PAID_STATUSES[number]))
      .map((o) => o.id);

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
        if (PAID_STATUSES.includes(o.status as typeof PAID_STATUSES[number])) {
          last7ByDay[d].amount += o.amount ?? 0;
        }
      }
    });

    let topProducts: SalesAnalytics["topProducts"] = [];

    if (paidOrderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id,quantity")
        .in("order_id", paidOrderIds);

      if (items?.length) {
        const agg = new Map<string, number>();
        items.forEach((r) => {
          agg.set(r.product_id, (agg.get(r.product_id) ?? 0) + (r.quantity ?? 0));
        });
        const sorted = [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const ids = sorted.map(([id]) => id);
        const { data: prods } = await supabase.from("products").select("id,name").in("id", ids);
        const nameMap = new Map((prods ?? []).map((p) => [p.id, p.name]));
        topProducts = sorted.map(([id, qty]) => ({
          productId: id,
          productName: nameMap.get(id) ?? "Unknown",
          qty,
        }));
      }
    }

    const analytics: SalesAnalytics = {
      ordersLast7Days: Object.entries(last7ByDay).map(([date, v]) => ({ date, count: v.count })),
      revenueLast7Days: Object.entries(last7ByDay).map(([date, v]) => ({ date, amount: v.amount })),
      topProducts,
    };

    await cacheSet(ANALYTICS_CACHE_KEY, JSON.stringify(analytics), CACHE_TTL);
    return success(analytics);
  } catch (err) {
    serverError("analytics.service getSalesAnalytics", err);
    return fail("Failed to fetch analytics");
  }
}
