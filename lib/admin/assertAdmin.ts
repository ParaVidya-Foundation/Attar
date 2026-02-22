/**
 * Single source of truth for admin access.
 * Use everywhere: middleware, layout, admin APIs, server actions.
 * Throws on failure so callers can redirect or return 401/403.
 */
import { createServerClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/security/logger";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Admin: not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

export class ProfileMissingError extends Error {
  constructor() {
    super("Admin: profile missing");
    this.name = "ProfileMissingError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Admin: forbidden");
    this.name = "ForbiddenError";
  }
}

export type AssertAdminResult = {
  user: User;
  supabase: SupabaseClient;
  profile: { role: string; full_name?: string | null };
};

/**
 * 1) getUser()
 * 2) load profiles.role (and full_name for layout)
 * 3) if no profile → throw ProfileMissingError
 * 4) if role !== 'admin' → throw ForbiddenError
 * Returns { user, supabase, profile } for layout/API use.
 *
 * @param supabase - Optional. Pass when in middleware (request-scoped client). Omit in layout/API/actions.
 */
export async function assertAdmin(
  supabase?: SupabaseClient
): Promise<AssertAdminResult> {
  const client = supabase ?? (await createServerClient());

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new NotAuthenticatedError();
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError) {
    serverError("assertAdmin", profileError);
    throw new ProfileMissingError();
  }

  if (!profile) {
    throw new ProfileMissingError();
  }

  if (profile.role !== "admin") {
    throw new ForbiddenError();
  }

  return {
    user,
    supabase: client,
    profile: { role: profile.role, full_name: profile.full_name ?? null },
  };
}
