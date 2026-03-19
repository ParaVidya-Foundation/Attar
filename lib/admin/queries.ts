/**
 * Admin queries — thin facade that delegates to the service layer.
 * Maintains backward-compatible exports so existing pages/components continue to work.
 * All business logic lives in lib/admin/services/*.
 */
import { analyticsService, ordersService, productsService, inventoryService, customersService } from "@/lib/admin/services";
import { serverError } from "@/lib/security/logger";

// Re-export types for backward compatibility
export type { OrderRow } from "@/lib/admin/services/orders.service";
export type { ProductRow, CategoryRow } from "@/lib/admin/services/products.service";
export type { InventoryRow } from "@/lib/admin/services/inventory.service";
export type { CustomerRow } from "@/lib/admin/services/customers.service";
export type { DashboardStats, SalesAnalytics } from "@/lib/admin/services/analytics.service";

function unwrap<T>(result: { ok: true; data: T } | { ok: false; error: string }, fallback: T): T {
  if (result.ok) return result.data;
  serverError("admin queries unwrap", result.error);
  throw new Error(result.error);
}

export async function getDashboardStats() {
  return unwrap(await analyticsService.getDashboardStats(), {
    totalProducts: 0, activeProducts: 0, totalOrders: 0, totalCustomers: 0,
    totalRevenue: 0, ordersToday: 0, revenueToday: 0, revenue7Days: 0, lowStockCount: 0,
  });
}

export async function getSalesAnalytics() {
  return unwrap(await analyticsService.getSalesAnalytics(), {
    ordersLast7Days: [], revenueLast7Days: [], topProducts: [],
  });
}

export async function getProducts(page = 1, search?: string): Promise<{ data: productsService.ProductRow[]; total: number }> {
  return unwrap(await productsService.getProducts(page, search), { data: [], total: 0 });
}

export async function getOrders(page = 1, statusFilter?: string): Promise<{ data: ordersService.OrderRow[]; total: number }> {
  return unwrap(await ordersService.getOrders(page, statusFilter), { data: [], total: 0 });
}

export async function getCustomers() {
  const result = await customersService.getCustomers();
  if (result.ok) return result.data.data;
  serverError("admin queries getCustomers", result.error);
  throw new Error(result.error);
}

export async function getInventoryRows() {
  const result = await inventoryService.getInventoryRows();
  if (result.ok) return result.data.data;
  serverError("admin queries getInventoryRows", result.error);
  throw new Error(result.error);
}

export async function getCategories() {
  return unwrap(await productsService.getCategories(), []);
}

export async function getOrderById(orderId: string) {
  const result = await ordersService.getOrderById(orderId);
  if (!result.ok) throw new Error(result.error);
  if (!result.data) return null;
  const d = result.data;
  return {
    order: {
      id: d.id,
      user_id: d.user_id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      status: d.status,
      amount: d.amount,
      currency: d.currency,
      razorpay_order_id: d.razorpay_order_id,
      razorpay_payment_id: d.razorpay_payment_id,
      created_at: d.created_at,
      user_email: d.user_email,
      customerEmail: d.customerEmail,
    },
    items: d.items,
  };
}
