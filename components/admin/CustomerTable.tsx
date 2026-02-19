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
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Email</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Total Orders</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Total Spent</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={c.user_email + i} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
              <td className="px-4 py-3 text-neutral-700">{c.user_email}</td>
              <td className="px-4 py-3 text-neutral-700">{c.total_orders}</td>
              <td className="px-4 py-3 text-neutral-700">₹{c.total_spent.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
