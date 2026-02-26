/**
 * Supabase browser client for client components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Client-safe: Returns null if env vars are missing instead of throwing.
 */
import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv, hasClientEnv } from "@/lib/env";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserSupabaseClient() {
  // Return cached client if available
  if (_client) return _client;

  // Check if env vars are available
  if (!hasClientEnv()) {
    const errorMsg = "Supabase environment variables not configured. Please check your Vercel environment variables.";
    throw new Error(`[supabase/client] ${errorMsg}`);
  }

  const env = getClientEnv();
  _client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return _client;
}

export const createClient = createBrowserSupabaseClient;
