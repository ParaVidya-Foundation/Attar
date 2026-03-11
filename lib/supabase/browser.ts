/**
 * Supabase browser client for client components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Throws a typed config error if env vars are missing.
 */
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { getSupabaseAuthStorageKey, requireClientSupabaseEnv } from "@/lib/env";

let _client: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function createBrowserClient() {
  if (_client) return _client;
  const env = requireClientSupabaseEnv();
  _client = createSupabaseBrowserClient(env.url, env.anonKey, {
    global: {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${env.anonKey}`,
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: getSupabaseAuthStorageKey(),
    },
  });
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.info("[supabase/browser] client created", {
      url: env.url,
      storageKey: getSupabaseAuthStorageKey(),
    });
  }
  return _client;
}
