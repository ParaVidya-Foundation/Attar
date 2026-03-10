import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { serverWarn, serverError } from "@/lib/security/logger";

/**
 * Cookie-based Supabase client for server components, server actions, and route handlers.
 *
 * Calls cookies() FIRST so Next.js opts the page into dynamic rendering before
 * any env-var check runs. This prevents prerender crashes during `next build`.
 * If env vars are missing at runtime, logs warnings and uses placeholder
 * values so handlers can return controlled errors instead of crashing.
 */
export async function createServerClient() {
  // cookies() must be called before anything else.
  // During prerender this triggers a DYNAMIC_USAGE bailout — Next.js skips
  // static generation for this page and renders it on-demand at request time.
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const hasSupabaseEnv = !!(supabaseUrl.trim() && supabaseAnonKey.trim());

  if (!hasSupabaseEnv) {
    serverWarn("supabase/server", "Supabase env not set");
  }

  return createSupabaseServerClient(
    hasSupabaseEnv ? supabaseUrl : "https://placeholder.supabase.co",
    hasSupabaseEnv ? supabaseAnonKey : "placeholder-anon-key",
    {
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
    },
  );
}

const SUPABASE_ENV_MSG =
  "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. Product/catalog fetches will fail.";

/**
 * Runtime guard: logs if Supabase env is missing.
 * Call before using createStaticClient() for catalog/product data to avoid silent empty results.
 */
export function assertSupabaseEnv(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const missing = !url.trim() || !anonKey.trim();
  if (!missing) return;
  serverWarn("supabase/server", SUPABASE_ENV_MSG);
}

/**
 * Lightweight Supabase client for data fetching in server components / ISR.
 * Logs and uses placeholder values if env vars are missing.
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const hasSupabaseEnv = !!(url.trim() && anonKey.trim());

  if (!hasSupabaseEnv) {
    serverError("supabase/server", SUPABASE_ENV_MSG);
  }

  return createSupabaseClient(
    hasSupabaseEnv ? url : "https://placeholder.supabase.co",
    hasSupabaseEnv ? anonKey : "placeholder-anon-key",
    {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    },
  );
}

export const createClient = createServerClient;
