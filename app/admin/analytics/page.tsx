import dynamic from "next/dynamic";
import { getSalesAnalytics } from "@/lib/admin/queries";
import { EmptyState } from "@/components/admin/EmptyState";
import { BarChart3 } from "lucide-react";

export const revalidate = 60;

const AnalyticsCharts = dynamic(
  () => import("@/components/admin/AnalyticsCharts").then((m) => ({ default: m.AnalyticsCharts })),
  { loading: () => <div className="h-64 animate-pulse rounded-xl bg-neutral-100" aria-hidden /> },
);

export default async function AdminAnalyticsPage() {
  const data = await getSalesAnalytics();

  const hasData =
    data.ordersLast7Days.some((d) => d.count > 0) ||
    data.revenueLast7Days.some((d) => d.amount > 0) ||
    data.topProducts.length > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-12 w-12" />}
        title="No analytics data yet"
        description="Charts will populate as orders come in"
      />
    );
  }

  return (
    <div>
      <AnalyticsCharts data={data} />
    </div>
  );
}
