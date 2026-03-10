// lib/env.ts

type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
  NEXT_PUBLIC_SITE_URL: string;
};

type ServerEnv = PublicEnv & {
  SUPABASE_SERVICE_ROLE_KEY: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  RAZORPAY_WEBHOOK_URL: string;
};

function required(name: string, value?: string) {
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

function validateUrl(name: string, value: string) {
  try {
    const url = new URL(value);

    if (process.env.NODE_ENV === "production") {
      if (url.protocol !== "https:") {
        throw new Error(`[env] ${name} must use HTTPS in production`);
      }

      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        throw new Error(`[env] ${name} cannot point to localhost in production`);
      }
    }

    return value;
  } catch {
    throw new Error(`[env] Invalid URL for ${name}`);
  }
}

/* ----------------------------- */
/* Public (browser-safe) env     */
/* ----------------------------- */

export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: validateUrl(
    "NEXT_PUBLIC_SUPABASE_URL",
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  ),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),

  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  ),

  NEXT_PUBLIC_RAZORPAY_KEY_ID: required(
    "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  ),

  NEXT_PUBLIC_SITE_URL: validateUrl(
    "NEXT_PUBLIC_SITE_URL",
    required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL),
  ),
};

/* ----------------------------- */
/* Server-only env               */
/* ----------------------------- */

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("[env] getServerEnv() called in the browser");
  }

  return {
    ...publicEnv,

    SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),

    RAZORPAY_KEY_SECRET: required("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET),

    RAZORPAY_WEBHOOK_SECRET: required("RAZORPAY_WEBHOOK_SECRET", process.env.RAZORPAY_WEBHOOK_SECRET),

    RAZORPAY_WEBHOOK_URL: validateUrl(
      "RAZORPAY_WEBHOOK_URL",
      required("RAZORPAY_WEBHOOK_URL", process.env.RAZORPAY_WEBHOOK_URL),
    ),
  };
}
