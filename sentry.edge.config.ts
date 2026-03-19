/**
 * Sentry Edge/middleware configuration.
 *
 * Lightweight — the edge runtime does not support profiling or session replay.
 * Captures middleware errors and edge route failures.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.2,

  sendDefaultPii: false,

  enableLogs: true,
});
