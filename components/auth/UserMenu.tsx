"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";
import { User as UserIcon, LogOut } from "lucide-react";

type UserMenuProps = {
  onItemClick?: () => void;
};

export function UserMenu({ onItemClick }: UserMenuProps = {}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        onClick={onItemClick}
        className="inline-flex items-center justify-center rounded-full p-2 hover:bg-white/40 transition"
      >
        <UserIcon className="h-5 w-5 text-slate-900/90" />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center rounded-full p-2 hover:bg-white/40 transition"
      >
        <UserIcon className="h-5 w-5 text-slate-900/90" />
      </button>
      {open && (
      <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg z-50">
        <div className="px-4 py-2 border-b border-neutral-100">
          <p className="text-xs text-neutral-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
        </div>
        <div className="py-1">
          <Link
            href="/account"
            onClick={onItemClick}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-neutral-50"
          >
            Account
          </Link>
          <button
            type="button"
            onClick={() => { handleLogout(); onItemClick?.(); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-neutral-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
