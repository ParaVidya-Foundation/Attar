/**
 * Environment validation — envalid (server), Zod (client-safe).
 * If required server vars are missing, getServerEnv() throws on first use (startup).
 * Use safe getters everywhere; do not read process.env directly in app code.
 */
import { cleanEnv, str, url } from "envalid";

const PRODUCTION_DOMAIN = "https://anandrasafragnance.com";

/** Server-only validated env (includes secrets). Lazy-initialized on first getServerEnv() call. */
let _serverEnv: ReturnType<typeof validateServerEnv> | null = null;

function validateServerEnv() {
  const env = cleanEnv(process.env, {
    NEXT_PUBLIC_SUPABASE_URL: url({ desc: "Supabase project URL" }),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str({ desc: "Supabase anon key" }),
    SUPABASE_SERVICE_ROLE_KEY: str({ desc: "Supabase service role key (server only)" }),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: str({ desc: "Razorpay key ID" }),
    RAZORPAY_KEY_SECRET: str({ desc: "Razorpay key secret (server only)" }),
    RAZORPAY_WEBHOOK_SECRET: str({ desc: "Razorpay webhook signing secret" }),
    NEXT_PUBLIC_SITE_URL: url({
      desc: "Canonical site URL",
      default: process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined,
    }),
  });

  if (
    process.env.NODE_ENV === "production" &&
    !env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_live_")
  ) {
    throw new Error("Live Razorpay key required in production");
  }

  return env;
}

export type ServerEnv = ReturnType<typeof validateServerEnv>;
export type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

/**
 * Single source of truth for site URL. Use everywhere instead of hardcoding.
 * In production, throws if NEXT_PUBLIC_SITE_URL is missing (fail fast).
 */
export function getSiteUrl(): string {
  const url =
    typeof process !== "undefined" && process.env
      ? process.env.NEXT_PUBLIC_SITE_URL
      : undefined;
  if (process.env.NODE_ENV === "production" && !url) {
    throw new Error(
      "[env] NEXT_PUBLIC_SITE_URL is required in production. Set it to https://anandrasafragnance.com",
    );
  }
  return (
    url ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : PRODUCTION_DOMAIN)
  );
}

/**
 * Validates and returns server-side environment variables (envalid).
 * Throws at first use if required vars are missing — no silent failure.
 * Lazy — only runs when first called at runtime; safe for build when env not yet set if you guard usage.
 */
export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;
  _serverEnv = validateServerEnv();
  return _serverEnv;
}

let _clientEnv: ClientEnv | null = null;

/**
 * Returns client-safe (NEXT_PUBLIC_*) environment variables.
 * On server, uses validated env. In production, returns fallbacks instead of throwing to avoid client crashes.
 */
export function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;
  const e = process.env;
  const url = e.NEXT_PUBLIC_SITE_URL;
  const valid =
    e.NEXT_PUBLIC_SUPABASE_URL &&
    e.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    e.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!valid && process.env.NODE_ENV === "production") {
    _clientEnv = {
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_PUBLIC_RAZORPAY_KEY_ID: "",
      NEXT_PUBLIC_SITE_URL: undefined,
    };
    return _clientEnv;
  }
  _clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: e.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: e.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_RAZORPAY_KEY_ID: e.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    NEXT_PUBLIC_SITE_URL: url || undefined,
  };
  return _clientEnv;
}

/**
 * Returns true if required client env vars are present.
 */
export function hasClientEnv(): boolean {
  const env = getClientEnv();
  return !!(
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  );
}
