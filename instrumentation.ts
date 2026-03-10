/**
 * Next.js instrumentation — runs once when Node runtime starts.
 * Used by Sentry for server-side tracing.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NODE_ENV === "production") {
      const { assertEnv } = await import("./lib/security/assertEnv");
      const { getServerEnv } = await import("./lib/env");
      assertEnv();
      getServerEnv();
    }
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
