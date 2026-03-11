/**
 * Supabase browser client for client components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Throws a typed config error if env vars are missing.
 */
import { createBrowserClient } from "@supabase/ssr";
import { requireClientSupabaseEnv } from "@/lib/env";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  if (_client) return _client;
  const env = requireClientSupabaseEnv();
  _client = createBrowserClient(env.url, env.anonKey);
  return _client;
}

export const createClient = createBrowserSupabaseClient;
