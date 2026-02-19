import { Suspense } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/admin/queries";
import { OrderTable } from "@/components/admin/OrderTable";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const { data: orders, total } = await getOrders(page);
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrderTable orders={orders} />
      </Suspense>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/orders?page=${page - 1}`}
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
              href={`/admin/orders?page=${page + 1}`}
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
