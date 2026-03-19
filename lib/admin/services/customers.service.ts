import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { serverError } from "@/lib/security/logger";
import type { ServiceResult } from "./types";
import { PAID_STATUSES, success, fail } from "./types";

export type CustomerRow = {
  user_email: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
};

export async function getCustomers(
  page = 1,
  pageSize = 50,
): Promise<ServiceResult<{ data: CustomerRow[]; total: number }>> {
  try {
    assertAdminEnv();
    const supabase = createAdminClient();

    const { data: profiles, error: pErr, count } = await supabase
      .from("profiles")
      .select("id,email", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((Math.max(1, page) - 1) * Math.min(pageSize, 100), Math.max(1, page) * Math.min(pageSize, 100) - 1);

    if (pErr) {
      serverError("customers.service getCustomers profiles", pErr);
      return fail(pErr.message);
    }

    if (!profiles?.length) return success({ data: [], total: count ?? 0 });

    const userIds = profiles.map((p) => p.id);
    const { data: orders } = await supabase
      .from("orders")
      .select("user_id,amount,status,created_at")
      .in("user_id", userIds);

    const emailMap = new Map(profiles.map((p) => [p.id, p.email ?? "(no email)"]));
    const agg = new Map<string, { orders: number; spent: number; lastOrder: string | null }>();

    for (const o of orders ?? []) {
      if (!o.user_id) continue;
      const email = emailMap.get(o.user_id) ?? "(no email)";
      const paid = PAID_STATUSES.includes(o.status as typeof PAID_STATUSES[number]);
      const curr = agg.get(email) ?? { orders: 0, spent: 0, lastOrder: null };
      curr.orders += 1;
      if (paid) curr.spent += o.amount ?? 0;
      if (o.created_at && (!curr.lastOrder || o.created_at > curr.lastOrder)) curr.lastOrder = o.created_at;
      agg.set(email, curr);
    }

    const data: CustomerRow[] = profiles.map((p) => {
      const email = p.email ?? "(no email)";
      const v = agg.get(email);
      return {
        user_email: email,
        total_orders: v?.orders ?? 0,
        total_spent: v?.spent ?? 0,
        last_order_date: v?.lastOrder ?? null,
      };
    });

    return success({ data, total: count ?? 0 });
  } catch (err) {
    serverError("customers.service getCustomers", err);
    return fail("Failed to fetch customers");
  }
}
