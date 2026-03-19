import { serverWarn } from "@/lib/security/logger";

const CLIENT_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const SERVER_ONLY_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
] as const;

const OPTIONAL_SERVER_ENV_KEYS = [
  "RAZORPAY_WEBHOOK_URL",
] as const;

type ClientEnvKey = (typeof CLIENT_ENV_KEYS)[number];
type ServerOnlyEnvKey = (typeof SERVER_ONLY_ENV_KEYS)[number];

type OptionalServerEnvKey = (typeof OPTIONAL_SERVER_ENV_KEYS)[number];

export type ClientEnv = Record<ClientEnvKey, string>;
export type ServerEnv = ClientEnv & Record<ServerOnlyEnvKey, string> & Partial<Record<OptionalServerEnvKey, string>>;

export class MissingEnvError extends Error {
  constructor(key: string) {
    super(`Missing environment variable: ${key}`);
    this.name = "MissingEnvError";
  }
}

let cachedClientEnv: ClientEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

function readRawEnv(key: string): string {
  // IMPORTANT:
  // In Next.js client bundles, only direct `process.env.NEXT_PUBLIC_*` accesses are inlined.
  // Dynamic indexing like `process.env[key]` will be empty in the browser.
  // So we special-case the public env keys we use client-side.
  switch (key) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    case "NEXT_PUBLIC_RAZORPAY_KEY_ID":
      return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? "";
    case "NEXT_PUBLIC_SITE_URL":
      return process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
    default:
      return process.env[key]?.trim() ?? "";
  }
}

export function requireEnv(key: ClientEnvKey | ServerOnlyEnvKey): string {
  const value = readRawEnv(key);
  if (!value) {
    throw new MissingEnvError(key);
  }
  return value;
}

function normalizeUrl(key: ClientEnvKey, value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid environment variable: ${key}`);
  }

  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error(`${key} must use https in production`);
  }

  return value.replace(/\/+$/, "");
}

function buildClientEnv(): ClientEnv {
  const env: ClientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: normalizeUrl("NEXT_PUBLIC_SUPABASE_URL", requireEnv("NEXT_PUBLIC_SUPABASE_URL")),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: requireEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
    NEXT_PUBLIC_SITE_URL: normalizeUrl("NEXT_PUBLIC_SITE_URL", requireEnv("NEXT_PUBLIC_SITE_URL")),
  };

  if (process.env.NODE_ENV === "production") {
    const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).host;
    serverWarn(
      "env",
      `[prod] env loaded: supabase_host=${host} anon_key_present=true razorpay_key_present=true site_url=${env.NEXT_PUBLIC_SITE_URL}`,
    );
  }

  return env;
}

function buildServerEnv(): ServerEnv {
  const clientEnv = getClientEnv();

  const env: ServerEnv = {
    ...clientEnv,
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    RAZORPAY_KEY_SECRET: requireEnv("RAZORPAY_KEY_SECRET"),
    RAZORPAY_WEBHOOK_SECRET: requireEnv("RAZORPAY_WEBHOOK_SECRET"),
  };

  const webhookUrl = readRawEnv("RAZORPAY_WEBHOOK_URL");
  if (webhookUrl) {
    env.RAZORPAY_WEBHOOK_URL = webhookUrl;
    if (process.env.NODE_ENV === "production") {
      const webhookUrlCheck = validateEnvUrl(webhookUrl);
      if (!webhookUrlCheck.ok) {
        serverWarn("env", `[prod] RAZORPAY_WEBHOOK_URL is not a valid public HTTPS URL: ${webhookUrlCheck.reason}`);
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    serverWarn("env", "[prod] RAZORPAY_WEBHOOK_URL not set — webhook delivery URL not tracked");
  }

  return env;
}

function validateEnvUrl(url: string): { ok: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return { ok: false, reason: "must use https" };
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
      return { ok: false, reason: "points to localhost" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "invalid URL" };
  }
}

export function getClientEnv(): ClientEnv {
  if (cachedClientEnv) return cachedClientEnv;
  cachedClientEnv = buildClientEnv();
  return cachedClientEnv;
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must only run on the server");
  }
  if (cachedServerEnv) return cachedServerEnv;
  cachedServerEnv = buildServerEnv();
  return cachedServerEnv;
}

export function getEnvPresence() {
  const allKeys = [...CLIENT_ENV_KEYS, ...SERVER_ONLY_ENV_KEYS, ...OPTIONAL_SERVER_ENV_KEYS];
  return Object.fromEntries(allKeys.map((key) => [key, Boolean(readRawEnv(key))])) as Record<
    ClientEnvKey | ServerOnlyEnvKey | OptionalServerEnvKey,
    boolean
  >;
}

export function hasClientEnv(): boolean {
  try {
    getClientEnv();
    return true;
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  return getClientEnv().NEXT_PUBLIC_SITE_URL;
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function requireClientSupabaseEnv(): { url: string; anonKey: string } {
  // Supabase env must be usable even if other NEXT_PUBLIC_* vars are missing.
  // (OAuth/login and public reads depend on Supabase; tying it to unrelated vars
  // like Razorpay keys makes auth brittle.)
  const urlRaw = readRawEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readRawEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!urlRaw) throw new MissingEnvError("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new MissingEnvError("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  let parsed: URL;
  try {
    parsed = new URL(urlRaw);
  } catch {
    throw new Error("Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use https in production");
  }

  return {
    url: urlRaw.replace(/\/+$/, ""),
    anonKey,
  };
}

export function requireServerSupabaseEnv(): { url: string; anonKey: string; serviceRoleKey: string } {
  const env = getServerEnv();
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getSupabaseAuthStorageKey(): string {
  const { url } = requireClientSupabaseEnv();
  const host = new URL(url).hostname;
  const projectRef = host.split(".")[0] ?? "project";
  return `sb-${projectRef}-auth-token`;
}
