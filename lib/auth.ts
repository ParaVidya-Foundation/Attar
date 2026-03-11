import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { serverWarn } from "@/lib/security/logger";

export async function getUser() {
  let supabase;
  try {
    supabase = await createServerClient();
  } catch (error) {
    serverWarn("auth", error instanceof Error ? error.message : "Supabase auth unavailable");
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  let supabase;
  try {
    supabase = await createServerClient();
  } catch (error) {
    serverWarn("auth", error instanceof Error ? error.message : "Supabase auth unavailable");
    redirect("/login?error=auth");
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { user, supabase };
}

export async function requireAuth() {
  const { user } = await requireUser();
  return user;
}

export async function requireAdmin() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }
  return { user, supabase };
}
