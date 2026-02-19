import { getSalesAnalytics } from "@/lib/admin/queries";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { EmptyState } from "@/components/admin/EmptyState";
import { BarChart3 } from "lucide-react";

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
