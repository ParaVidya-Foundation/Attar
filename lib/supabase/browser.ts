import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createSupabaseBrowserClient(url, anonKey);
}
