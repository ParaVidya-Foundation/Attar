import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AccountMain } from "@/components/account/accountmain";
import AccountSidebar from "@/components/account/accountsidebar";

export const metadata: Metadata = pageMetadata({
  title: "Account",
  description: "Manage your account details, orders, and addresses. Secure account dashboard.",
  path: "/account",
  type: "website",
});

export default function AccountPage() {
  return (
    <section className="min-h-[70vh] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <AccountSidebar />
        <AccountMain />
      </div>
    </section>
  );
}
