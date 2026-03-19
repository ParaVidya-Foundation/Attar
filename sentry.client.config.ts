/**
 * Sentry client (browser) configuration.
 *
 * Captures: frontend errors, React rendering failures, checkout crashes,
 * performance traces, and full user session replays on error.
 *
 * Session Replay: when a user hits an error, Sentry records the entire
 * session so you can watch exactly what happened (clicks, navigation,
 * network requests). Inputs are masked for PII safety.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,

  enabled: process.env.NODE_ENV === "production",

  tracesSampleRate:
    Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) || 0.2,

  replaysSessionSampleRate:
    Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE) || 0.05,

  replaysOnErrorSampleRate:
    Number(process.env.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE) || 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllInputs: true,
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  sendDefaultPii: false,

  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
    "AbortError",
    "ChunkLoadError",
    "Non-Error promise rejection captured",
    /^ResizeObserver loop/,
    /^Loading chunk \d+ failed/,
  ],
});
