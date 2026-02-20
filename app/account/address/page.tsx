import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import AddressList from "@/components/account/addresslist";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Addresses",
  robots: "noindex",
};

export default async function AddressPage() {
  const { user, supabase } = await requireUser();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return <AddressList addresses={addresses ?? []} />;
}
