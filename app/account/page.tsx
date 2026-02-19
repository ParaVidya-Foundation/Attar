import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AccountMain } from "@/components/account/accountmain";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = pageMetadata({
  title: "Account",
  description: "Manage your account details, orders, and addresses. Secure account dashboard.",
  path: "/account",
  type: "website",
});

export default async function AccountPage() {
  const { user, supabase } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AccountMain
      profile={{
        title: profile?.title ?? "",
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        phone: profile?.phone ?? "",
        birthday: profile?.birthday ?? "",
        email: user.email ?? "",
      }}
    />
  );
}
