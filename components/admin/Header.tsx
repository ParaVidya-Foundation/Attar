"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/inventory": "Inventory",
  "/admin/customers": "Customers",
  "/admin/analytics": "Analytics",
};

type HeaderProps = {
  name?: string | null;
  email?: string | null;
};

export function Header({ name, email }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle =
    pathname.match(/^\/admin\/orders\/[^/]+$/) ? "Order" : (PAGE_TITLES[pathname] ?? "Admin");

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      // Still redirect even if logout fails
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <h1 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">{pageTitle}</h1>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <span className="hidden sm:inline text-sm text-neutral-700 truncate max-w-[120px]">
          {name || email || "Admin"}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
