/**
 * Sentry server-side configuration.
 *
 * Captures: API route errors, server component failures, slow transactions,
 * Razorpay webhook failures, Supabase query errors.
 *
 * Profiling enabled — shows slow functions in Sentry Performance.
 * Replay is client-only and NOT included here.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.2,

  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1,

  sendDefaultPii: false,

  enableLogs: true,

  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],

  beforeSend(event) {
    const msg = event.exception?.values?.[0]?.value ?? "";
    if (msg.includes("NEXT_NOT_FOUND") || msg.includes("NEXT_REDIRECT")) {
      return null;
    }
    return event;
  },
});
