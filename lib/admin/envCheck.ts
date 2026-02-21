/**
 * Admin environment validation.
 * Call before any admin operation that needs service-role or Supabase.
 * Throws with a clear message so admin never fails silently.
 */
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function assertAdminEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      "Admin system misconfigured: service role missing. Set: " + missing.join(", ")
    );
  }
}
