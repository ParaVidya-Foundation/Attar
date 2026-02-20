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
    console.error(`[supabase/client] ${errorMsg}`);
    
    // In production, return a no-op client to prevent crashes
    // This allows the app to render but Supabase calls will fail gracefully
    if (typeof window !== "undefined") {
      // Return a minimal client that will fail gracefully on use
      const env = getClientEnv();
      if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Create a client with placeholder values - it will fail on actual use but won't crash
        _client = createBrowserClient("https://placeholder.invalid", "placeholder");
        return _client;
      }
    }
    
    // If we're here, something went wrong - throw only in development
    if (process.env.NODE_ENV !== "production") {
      throw new Error(errorMsg);
    }
    
    // Production fallback: return placeholder client
    _client = createBrowserClient("https://placeholder.invalid", "placeholder");
    return _client;
  }

  const env = getClientEnv();
  _client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return _client;
}

export const createClient = createBrowserSupabaseClient;
