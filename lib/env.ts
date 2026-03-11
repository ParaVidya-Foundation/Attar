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

type ClientEnvKey = (typeof CLIENT_ENV_KEYS)[number];
type ServerOnlyEnvKey = (typeof SERVER_ONLY_ENV_KEYS)[number];

export type ClientEnv = Record<ClientEnvKey, string>;
export type ServerEnv = ClientEnv & Record<ServerOnlyEnvKey, string>;

export class MissingEnvError extends Error {
  constructor(key: string) {
    super(`Missing environment variable: ${key}`);
    this.name = "MissingEnvError";
  }
}

let cachedClientEnv: ClientEnv | null = null;
let cachedServerEnv: ServerEnv | null = null;

function readRawEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
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

  return {
    ...clientEnv,
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    RAZORPAY_KEY_SECRET: requireEnv("RAZORPAY_KEY_SECRET"),
    RAZORPAY_WEBHOOK_SECRET: requireEnv("RAZORPAY_WEBHOOK_SECRET"),
  };
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
  const allKeys = [...CLIENT_ENV_KEYS, ...SERVER_ONLY_ENV_KEYS];
  return Object.fromEntries(allKeys.map((key) => [key, Boolean(readRawEnv(key))])) as Record<
    ClientEnvKey | ServerOnlyEnvKey,
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
  const env = getClientEnv();
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
