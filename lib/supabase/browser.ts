/**
 * Supabase browser client for client components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Throws a typed config error if env vars are missing.
 */
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { requireClientSupabaseEnv } from "@/lib/env";

let _client: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function createBrowserClient() {
  if (_client) return _client;
  const env = requireClientSupabaseEnv();
  _client = createSupabaseBrowserClient(env.url, env.anonKey);
  return _client;
}
