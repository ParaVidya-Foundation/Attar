/**
 * Supabase service-role client for server-only operations.
 * NEVER expose this client to the browser — uses SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { requireServerSupabaseEnv } from "@/lib/env";

export function createAdminClient() {
  const { url, serviceRoleKey } = requireServerSupabaseEnv();

  return createClient(
    url,
    serviceRoleKey,
    {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    },
  );
}
