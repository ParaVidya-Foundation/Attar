import { getInventoryRows } from "@/lib/admin/queries";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const revalidate = 60;

export default async function AdminInventoryPage() {
  const rows = await getInventoryRows();

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-600">
        Edit stock inline. Rows with stock &lt; 10 are highlighted.
      </p>
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryTable rows={rows} />
      </Suspense>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
