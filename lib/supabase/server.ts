import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { serverWarn, serverError } from "@/lib/security/logger";

/**
 * Cookie-based Supabase client for server components, server actions, and route handlers.
 *
 * Calls cookies() FIRST so Next.js opts the page into dynamic rendering before
 * any env-var check runs. This prevents prerender crashes during `next build`.
 * If env vars are missing at runtime, this throws immediately to avoid
 * silent checkout/auth failures in production.
 */
export async function createServerClient() {
  // cookies() must be called before anything else.
  // During prerender this triggers a DYNAMIC_USAGE bailout — Next.js skips
  // static generation for this page and renders it on-demand at request time.
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    serverWarn("supabase/server", "Supabase env not set");
    throw new Error("[supabase/server] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
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

const SUPABASE_ENV_MSG =
  "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. Product/catalog fetches will fail.";

/**
 * Runtime guard: in development throws if Supabase env is missing; in production logs only.
 * Call before using createStaticClient() for catalog/product data to avoid silent empty results.
 */
export function assertSupabaseEnv(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const missing = !url.trim() || !anonKey.trim();
  if (!missing) return;
  if (process.env.NODE_ENV === "development") {
    throw new Error(`[supabase/server] ${SUPABASE_ENV_MSG}`);
  }
  serverError("supabase/server", SUPABASE_ENV_MSG);
}

/**
 * Lightweight Supabase client for data fetching in server components / ISR.
 * Throws if env vars are missing (no silent empty responses).
 */
export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url.trim() || !anonKey.trim()) {
    throw new Error(`[supabase/server] ${SUPABASE_ENV_MSG}`);
  }

  return createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const createClient = createServerClient;
