/**
 * Supabase service-role client for server-only operations.
 * NEVER expose this client to the browser — uses SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { serverWarn } from "@/lib/security/logger";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasEnv = !!(url?.trim() && serviceKey?.trim());

  if (!hasEnv) {
    serverWarn(
      "supabase/admin",
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail until env is configured.",
    );
  }

  return createClient(
    hasEnv ? (url as string) : "https://placeholder.supabase.co",
    hasEnv ? (serviceKey as string) : "placeholder-service-role-key",
    {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    },
  );
}
