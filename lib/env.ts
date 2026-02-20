import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

let _serverEnv: ServerEnv | null = null;
let _clientEnv: ClientEnv | null = null;

/**
 * Validates and returns server-side environment variables.
 * Lazy — only runs when first called at runtime, never during build.
 */
export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing or invalid environment variables: ${missing}`);
    }
    console.warn(`[env] Missing or invalid environment variables: ${missing}`);
    return {} as ServerEnv;
  }
  _serverEnv = parsed.data;
  return _serverEnv;
}

/**
 * Validates and returns client-safe (NEXT_PUBLIC_*) environment variables.
 * Lazy — only runs when first called at runtime, never during build.
 */
export function getClientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;

  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing or invalid public environment variables: ${missing}`);
    }
    console.warn(`[env] Missing or invalid public environment variables: ${missing}`);
    return {} as ClientEnv;
  }
  _clientEnv = parsed.data;
  return _clientEnv;
}
