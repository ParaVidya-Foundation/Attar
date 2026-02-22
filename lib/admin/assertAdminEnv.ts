/**
 * Admin environment guard. Fail fast if required env vars are missing.
 * Use before any admin operation. Never silently proceed without service role.
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
      "Admin system misconfigured: missing " + missing.join(", ") + ". Set in environment."
    );
  }
}
