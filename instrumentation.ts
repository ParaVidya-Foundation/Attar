/**
 * Next.js instrumentation — runs once when Node runtime starts.
 * Used by Sentry for server-side tracing.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NODE_ENV === "production") {
      const { getServerEnv } = await import("./lib/env");
      getServerEnv();
    }
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
