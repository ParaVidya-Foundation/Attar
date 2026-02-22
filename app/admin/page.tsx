import dynamic from "next/dynamic";
import { getDashboardStats, getSalesAnalytics } from "@/lib/admin/queries";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { EmptyState } from "@/components/admin/EmptyState";
import { LayoutDashboard } from "lucide-react";

export const revalidate = 60;

const DashboardCharts = dynamic(
  () => import("@/components/admin/DashboardCharts").then((m) => ({ default: m.DashboardCharts })),
  { loading: () => <div className="h-72 animate-pulse rounded-xl bg-neutral-100" aria-hidden /> },
);

export default async function AdminDashboardPage() {
  const [stats, analytics] = await Promise.all([getDashboardStats(), getSalesAnalytics()]);

  const hasData =
    stats.totalProducts > 0 ||
    stats.totalOrders > 0 ||
    stats.totalCustomers > 0 ||
    stats.totalRevenue > 0;

  return (
    <div className="space-y-8">
      <DashboardStats stats={stats} />
      {!hasData ? (
        <EmptyState
          icon={<LayoutDashboard className="h-12 w-12 text-neutral-400" />}
          title="No data yet"
          description="Stats and charts will populate when you have products, orders, and customers"
        />
      ) : (
        <DashboardCharts data={analytics} />
      )}
    </div>
  );
}
