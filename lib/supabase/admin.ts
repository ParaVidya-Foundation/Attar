/**
 * Supabase service-role client for server-only operations
 * Use in Edge Functions, scripts, and server-side admin tasks
 * NEVER expose this client to the browser — uses SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
