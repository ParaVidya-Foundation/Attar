import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cookie-based Supabase client for server components, server actions, and route handlers.
 *
 * Calls cookies() FIRST so Next.js opts the page into dynamic rendering before
 * any env-var check runs. This prevents prerender crashes during `next build`.
 * If env vars are still missing at runtime, a no-op SSR client is returned
 * whose auth.getUser() resolves to { user: null }, letting requireUser()
 * redirect to /login instead of crashing.
 */
export async function createServerClient() {
  // cookies() must be called before anything else.
  // During prerender this triggers a DYNAMIC_USAGE bailout — Next.js skips
  // static generation for this page and renders it on-demand at request time.
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[supabase/server] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. " +
        "Returning no-op client — auth calls will resolve to null.",
    );
    // Return a real SSR-shaped client with a placeholder URL.
    // auth.getUser() will return { user: null } because there is no valid
    // session, which causes requireUser() to redirect to /login.
    return createSupabaseServerClient("https://placeholder.invalid", "placeholder", {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    });
  }

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
