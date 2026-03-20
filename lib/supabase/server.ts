import "server-only";

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { serverWarn } from "@/lib/security/logger";
import { requireClientSupabaseEnv } from "@/lib/env";

/**
 * Cookie-based Supabase client for server components, server actions, and route handlers.
 *
 * Calls cookies() FIRST so Next.js opts the page into dynamic rendering before
 * any env-var check runs. This prevents prerender crashes during `next build`.
 * If env vars are missing at runtime, logs warnings and throws a typed error.
 */
export async function createServerClient() {
  // cookies() must be called before anything else.
  // During prerender this triggers a DYNAMIC_USAGE bailout — Next.js skips
  // static generation for this page and renders it on-demand at request time.
  const cookieStore = await cookies();

  let supabaseUrl: string;
  let supabaseAnonKey: string;
  try {
    const env = requireClientSupabaseEnv();
    supabaseUrl = env.url;
    supabaseAnonKey = env.anonKey;
  } catch (error) {
    serverWarn("supabase/server", "Supabase env not set");
    throw error;
  }

  const isProduction = process.env.NODE_ENV === "production";

  return createSupabaseServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                secure: isProduction,
                sameSite: "lax",
                httpOnly: true,
                path: "/",
              });
            });
          } catch {
            // Server Components cannot set cookies — only Route Handlers and Server Actions can
          }
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
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
  try {
    requireClientSupabaseEnv();
  } catch {
    serverWarn("supabase/server", SUPABASE_ENV_MSG);
  }
}

/**
 * Lightweight Supabase client for data fetching in server components / ISR.
 * Throws if env vars are missing so callers can decide how to degrade.
 */
export function createStaticClient() {
  const { url, anonKey } = requireClientSupabaseEnv();

  return createSupabaseClient(
    url,
    anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export const createClient = createServerClient;
