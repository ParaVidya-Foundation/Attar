/**
 * GET /api/admin/health — Admin system health. Requires admin auth; returns 401/403 otherwise.
 * Returns env, serviceRole, adminUser, profileExists, activeProductCount.
 */
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { assertAdminEnv } from "@/lib/admin/assertAdminEnv";
import { assertAdmin, NotAuthenticatedError, ForbiddenError, ProfileMissingError } from "@/lib/admin/assertAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

function adminErrorStatus(err: unknown): { status: number; body: { error: string } } {
  if (err instanceof NotAuthenticatedError) return { status: 401, body: { error: "Not authenticated" } };
  if (err instanceof ForbiddenError || err instanceof ProfileMissingError) return { status: 403, body: { error: "Forbidden" } };
  return { status: 500, body: { error: "Internal server error" } };
}

export async function GET(req: Request) {
  const identifier = getClientIdentifier(req);
  const limit = rateLimit(identifier, 30, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let profileExists = false;
  let adminUser = false;
  try {
    assertAdminEnv();
    const result = await assertAdmin();
    profileExists = true;
    adminUser = result.profile.role === "admin";
  } catch (err) {
    if (err instanceof NotAuthenticatedError || err instanceof ForbiddenError || err instanceof ProfileMissingError) {
      const { status, body } = adminErrorStatus(err);
      return NextResponse.json(body, { status });
    }
    throw err;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const env = !!(url && anonKey && serviceKey);

  let serviceRole = false;
  let activeProductCount = 0;
  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await admin.from("profiles").select("id").limit(1);
      serviceRole = true;
      try {
        const adminClient = createAdminClient();
        const { count } = await adminClient.from("products").select("id", { count: "exact", head: true }).eq("is_active", true);
        activeProductCount = count ?? 0;
      } catch {
        activeProductCount = 0;
      }
    } catch {
      serviceRole = false;
    }
  }

  return NextResponse.json({
    env,
    serviceRole,
    adminUser,
    profileExists,
    activeProductCount,
  });
}
