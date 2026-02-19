import { getDashboardStats } from "@/lib/admin/queries";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { EmptyState } from "@/components/admin/EmptyState";
import { LayoutDashboard } from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const hasData =
    stats.totalProducts > 0 ||
    stats.totalOrders > 0 ||
    stats.totalCustomers > 0 ||
    stats.totalRevenue > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={<LayoutDashboard className="h-12 w-12" />}
        title="No data yet"
        description="Stats will appear when you have products, orders, and customers"
      />
    );
  }

  return (
    <div>
      <DashboardStats stats={stats} />
    </div>
  );
}
