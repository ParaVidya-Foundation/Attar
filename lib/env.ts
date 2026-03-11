/**
 * Environment validation and safe accessors.
 * Missing variables are logged as warnings so the app can stay up and return controlled errors.
 */
import { validatePublicHttpsUrl } from "@/lib/payments/network-safety";
import { serverWarn } from "@/lib/security/logger";

const PRODUCTION_DOMAIN = "https://anandrasafragnance.com";

const warnedMessages = new Set<string>();
let _serverEnv: ServerEnv | null = null;

export type ServerEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_SITE_URL: string;
};
export type ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export class MissingEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingEnvError";
  }
}

function warnOnce(message: string): void {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  serverWarn("env", message);
}

function getRawEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function buildServerEnv(): ServerEnv {
  const env: ServerEnv = {
    NEXT_PUBLIC_SUPABASE_URL: getRawEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getRawEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: getRawEnv("SUPABASE_SERVICE_ROLE_KEY"),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: getRawEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
    RAZORPAY_KEY_SECRET: getRawEnv("RAZORPAY_KEY_SECRET"),
    RAZORPAY_WEBHOOK_SECRET: getRawEnv("RAZORPAY_WEBHOOK_SECRET"),
    NEXT_PUBLIC_SITE_URL: getRawEnv("NEXT_PUBLIC_SITE_URL"),
  };

  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    warnOnce(`Missing environment variables: ${missing.join(", ")}`);
  }

  if (process.env.NODE_ENV === "production") {
    if (env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !env.NEXT_PUBLIC_RAZORPAY_KEY_ID.startsWith("rzp_live_")) {
      warnOnce("Production is using a non-live Razorpay key ID. Expected prefix: rzp_live_");
    }

    if (env.NEXT_PUBLIC_SITE_URL) {
      const siteUrlCheck = validatePublicHttpsUrl(env.NEXT_PUBLIC_SITE_URL);
      if (!siteUrlCheck.ok) {
        warnOnce(`NEXT_PUBLIC_SITE_URL is invalid in production (${siteUrlCheck.reason ?? "unknown reason"})`);
      }
    } else {
      warnOnce(`NEXT_PUBLIC_SITE_URL is missing in production. Falling back to ${PRODUCTION_DOMAIN}`);
    }
  }

  return env;
}

/**
 * Single source of truth for site URL. Use everywhere instead of hardcoding.
 */
export function getSiteUrl(): string {
  const rawUrl = getRawEnv("NEXT_PUBLIC_SITE_URL");
  if (rawUrl) {
    return rawUrl.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    warnOnce(`[env] NEXT_PUBLIC_SITE_URL is not set in production. Using fallback ${PRODUCTION_DOMAIN}`);
    return PRODUCTION_DOMAIN;
  }
  return "";
}

export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;
  _serverEnv = buildServerEnv();
  return _serverEnv;
}

let _clientEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;
  const e = process.env;
  const url = e.NEXT_PUBLIC_SITE_URL;
  const valid =
    e.NEXT_PUBLIC_SUPABASE_URL && e.NEXT_PUBLIC_SUPABASE_ANON_KEY && e.NEXT_PUBLIC_RAZORPAY_KEY_ID;
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

export function requireClientSupabaseEnv(): { url: string; anonKey: string } {
  const env = getClientEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new MissingEnvError(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure them in Vercel project settings.",
    );
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function requireServerSupabaseEnv(): { url: string; anonKey: string; serviceRoleKey: string } {
  const env = getServerEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new MissingEnvError(
      "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
