import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/admin/queries";
import { OrderDetailView } from "@/components/admin/OrderDetailView";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getOrderById(id);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-neutral-500 hover:text-neutral-700">
        ← Orders
      </Link>
      <OrderDetailView order={data.order} items={data.items} />
    </div>
  );
}
