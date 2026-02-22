import { Suspense } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/admin/queries";
import { OrderTable } from "@/components/admin/OrderTable";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_FILTERS = ["all", "pending", "paid", "shipped", "delivered", "failed", "cancelled"] as const;

type Props = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

export const revalidate = 60;

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const statusFilter = params.status ?? "all";

  const { data: orders, total } = await getOrders(page, statusFilter);
  const totalPages = Math.ceil(total / 20);

  function filterHref(status: string) {
    const p = new URLSearchParams();
    if (status !== "all") p.set("status", status);
    p.set("page", "1");
    return `/admin/orders?${p.toString()}`;
  }

  function pageHref(p: number) {
    const sp = new URLSearchParams();
    if (statusFilter !== "all") sp.set("status", statusFilter);
    sp.set("page", String(p));
    return `/admin/orders?${sp.toString()}`;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={filterHref(s)}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors ${
              statusFilter === s
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrderTable orders={orders} />
      </Suspense>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-neutral-600">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
