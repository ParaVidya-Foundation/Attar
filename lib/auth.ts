import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const supabase = await createServerClient();
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
