import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats as Stats } from "@/lib/admin/queries";
import { Package, ShoppingCart, Users, IndianRupee, TrendingUp, Boxes, AlertTriangle } from "lucide-react";

const iconClass = "h-5 w-5 text-neutral-500";
const rupee = (v: number) => `₹${(Number(v) / 100).toLocaleString("en-IN")}`;

const statCards: { key: keyof Stats; label: string; icon: React.ReactNode; format?: (v: number) => string }[] = [
  { key: "totalProducts", label: "Total Products", icon: <Package className={iconClass} /> },
  { key: "activeProducts", label: "Active Products", icon: <Package className={iconClass} /> },
  { key: "totalOrders", label: "Total Orders", icon: <ShoppingCart className={iconClass} /> },
  { key: "totalCustomers", label: "Customers", icon: <Users className={iconClass} /> },
  { key: "totalRevenue", label: "Total Revenue", icon: <IndianRupee className={iconClass} />, format: rupee },
  { key: "ordersToday", label: "Orders Today", icon: <TrendingUp className={iconClass} /> },
  { key: "revenueToday", label: "Revenue Today", icon: <IndianRupee className={iconClass} />, format: rupee },
  { key: "revenue7Days", label: "Revenue (7 days)", icon: <IndianRupee className={iconClass} />, format: rupee },
  { key: "lowStockCount", label: "Low Stock", icon: <AlertTriangle className={iconClass} /> },
];

type Props = {
  stats: Stats;
};

export function DashboardStats({ stats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {statCards.map(({ key, label, icon, format }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">{label}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-neutral-900">
              {format ? format(stats[key] as number) : String(stats[key])}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

