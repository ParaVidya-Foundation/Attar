"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, LogOut, HelpCircle, FileQuestion, Mail } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account", label: "My account", icon: User },
  { href: "/account/orders", label: "My orders", icon: ShoppingBag },
  { href: "/account/address", label: "My address", icon: MapPin },
] as const;

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-full shrink-0 border-b border-ash/40 bg-cream/50 lg:w-72 lg:border-b-0 lg:border-r lg:py-10"
      aria-label="Account navigation"
    >
      <nav className="px-4 py-6 lg:px-6" aria-label="Account">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/account" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? "bg-ink text-cream" : "text-charcoal/90 hover:bg-ash/40 hover:text-ink"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/logout"
          className="mt-6 flex items-center gap-3 px-4 py-2 text-sm font-medium text-ink/90 underline-offset-2 hover:text-ink hover:underline"
        >
          <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          Log out
        </Link>

        <div className="mt-10 rounded-2xl border border-ash/50 bg-cream/80 p-5">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 text-ink/80" aria-hidden />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">A helping hand?</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-charcoal/85">
            Need help with your order? Our team is available Monday–Friday, 10am–6pm GMT.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link
              href="/policies#faq"
              className="inline-flex items-center gap-1.5 font-medium text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
            >
              <FileQuestion className="h-3.5 w-3.5" aria-hidden />
              FAQs
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-medium text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              Contact us
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
