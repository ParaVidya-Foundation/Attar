import { redirect } from "next/navigation";
import { assertAdminEnv } from "@/lib/admin/envCheck";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { serverError } from "@/lib/security/logger";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    assertAdminEnv();
  } catch (err) {
    serverError("admin layout", err);
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
    serverError("admin layout", err);
    throw err;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden md:pl-60">
        <div className="sticky top-0 z-20 shrink-0 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
          <Header name={profile?.full_name} email={user.email} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
