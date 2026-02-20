import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-neutral-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <Header name={profile?.full_name} email={user.email} />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
