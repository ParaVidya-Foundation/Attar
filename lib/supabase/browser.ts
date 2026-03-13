/**
 * Supabase browser client for client components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Logs a structured error if env vars are missing but does not crash the site.
 */
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { getSupabaseAuthStorageKey, requireClientSupabaseEnv } from "@/lib/env";

let _client: ReturnType<typeof createSupabaseBrowserClient> | null = null;
let _envError = false;

export function createBrowserClient() {
  if (_client) return _client;

  let env: { url: string; anonKey: string };
  try {
    env = requireClientSupabaseEnv();
  } catch (err) {
    if (!_envError) {
      _envError = true;
      // eslint-disable-next-line no-console
      console.error(
        "[supabase/browser] Missing environment variables:",
        err instanceof Error ? err.message : String(err),
        "\nRequired: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
    }
    throw err;
  }

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
  return _client;
}
