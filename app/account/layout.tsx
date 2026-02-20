import { requireUser } from "@/lib/auth";
import AccountSidebar from "@/components/account/accountsidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <section className="min-h-[70vh] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <AccountSidebar />
        {children}
      </div>
    </section>
  );
}
