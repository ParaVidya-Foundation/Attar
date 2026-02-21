import { redirect } from "next/navigation";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    assertAdminEnv();
  } catch (err) {
    console.error("[admin layout] Environment check failed:", err);
    throw err;
  }

  let user: Awaited<ReturnType<typeof assertAdmin>>["user"];
  let profile: Awaited<ReturnType<typeof assertAdmin>>["profile"];

  try {
    const result = await assertAdmin();
    user = result.user;
    profile = result.profile;
  } catch (err) {
    if (err instanceof NotAuthenticatedError) {
      redirect("/login");
    }
    if (err instanceof ForbiddenError || err instanceof ProfileMissingError) {
      redirect("/");
    }
    console.error("[admin layout] assertAdmin failed:", err);
    throw err;
  }

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
