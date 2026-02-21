/**
 * GET /api/admin/health — Admin system health (no auth required).
 * Returns env, service role, and current user admin/profile status.
 */
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  const env = !!(url && anonKey && serviceKey);

  let serviceRole: boolean = false;
  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await admin.from("profiles").select("id").limit(1);
      serviceRole = true;
    } catch {
      serviceRole = false;
    }
  }

  let adminUser = false;
  let profileExists = false;

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      profileExists = !!profile;
      adminUser = profile?.role === "admin";
    }
  } catch {
    // Not logged in or profile fetch failed
  }

  return NextResponse.json({
    env,
    serviceRole,
    adminUser,
    profileExists,
  });
}
