import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    // During build / static generation env vars may not be present.
    // Log a warning instead of throwing so the build doesn't crash.
    // Callers (fetchers) catch downstream Supabase errors and return [].
    console.warn(`[supabase/server] ${name} is not set`);
    return "";
  }
  return value;
}

export async function createServerClient() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are required for server client");
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Route Handlers may throw when setting cookies during redirect
        }
      },
    },
  });
}

/**
 * Lightweight Supabase client for data fetching in server components / ISR.
 * Returns null if env vars are missing (build-time safety).
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const createClient = createServerClient;
