/**
 * App-level environment assertion. Fail fast if required env is missing.
 * No silent fallback. Use at startup or in critical server paths.
 */
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function assertEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error("Missing required environment variables: " + missing.join(", "));
  }
}

export function assertWebhookEnv(): void {
  assertEnv();
  if (!process.env.RAZORPAY_WEBHOOK_SECRET?.trim()) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET for webhook verification");
  }
}
