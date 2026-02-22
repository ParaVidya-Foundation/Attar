"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { LOGO_PATH } from "@/lib/seo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 z-30 h-screen border-r border-neutral-200/80 bg-white/95 backdrop-blur-sm transition-[width] duration-300 ease-out ${
        collapsed ? "w-[4.5rem]" : "w-60"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center border-b border-neutral-200/80 py-4 ${collapsed ? "px-2" : "px-3"}`}
      >
        <Link
          href="/admin"
          className="flex items-center justify-center overflow-hidden"
          aria-label="Anand Ras Admin – Home"
        >
          <Image
            src={LOGO_PATH}
            alt="Anand Ras"
            width={300}
            height={80}
            className="h-9 w-auto max-w-full object-contain sm:h-10"
          />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-neutral-200/80 py-3 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
    </aside>
  );
}
