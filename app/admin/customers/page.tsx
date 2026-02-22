import { getCustomers } from "@/lib/admin/queries";
import { CustomerTable } from "@/components/admin/CustomerTable";

export const revalidate = 60;

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <CustomerTable customers={customers} />
    </div>
  );
}
