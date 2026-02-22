import type { CustomerRow } from "@/lib/admin/queries";
import { EmptyState } from "./EmptyState";
import { Users } from "lucide-react";

type Props = {
  customers: CustomerRow[];
};

export function CustomerTable({ customers }: Props) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No customers yet"
        description="Customer data appears when orders are placed"
      />
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {customers.map((c, i) => (
          <div
            key={c.user_email + i}
            className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2"
          >
            <p className="font-medium text-neutral-900 truncate">{c.user_email}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Orders</p>
                <p className="mt-0.5 font-medium text-neutral-900">{c.total_orders}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Spent</p>
                <p className="mt-0.5 font-medium text-neutral-900">₹{(c.total_spent / 100).toLocaleString("en-IN")}</p>
              </div>
              {c.last_order_date && (
                <p className="col-span-2 text-xs text-neutral-500">
                  Last order: {new Date(c.last_order_date).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Email</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Total Orders</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Total Spent</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-700">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.user_email + i} className="border-b border-neutral-100 last:border-0 transition-colors hover:bg-neutral-50/50">
                <td className="px-4 py-3 text-neutral-700">{c.user_email}</td>
                <td className="px-4 py-3 text-neutral-700">{c.total_orders}</td>
                <td className="px-4 py-3 text-neutral-700">₹{(c.total_spent / 100).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("en-IN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
