/**
 * Supabase browser client for client components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Client-safe: Returns placeholder client if env vars are missing instead of throwing.
 */
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { getClientEnv, hasClientEnv } from "@/lib/env";

let _client: ReturnType<typeof createSupabaseBrowserClient> | null = null;
let _warned = false;

export function createBrowserClient() {
  // Return cached client if available
  if (_client) return _client;

  // Check if env vars are available
  if (!hasClientEnv()) {
    if (!_warned) {
      _warned = true;
      // eslint-disable-next-line no-console
      console.warn(
        "[supabase/browser] Supabase environment variables not configured. Using placeholder client.",
      );
    }
    _client = createSupabaseBrowserClient("https://placeholder.supabase.co", "placeholder-anon-key");
    return _client;
  }

  const env = getClientEnv();
  _client = createSupabaseBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return _client;
}
