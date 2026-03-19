/**
 * Next.js instrumentation — runs once when Node runtime starts.
 * Used by Sentry for server-side tracing and automatic error capture.
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

/**
 * Captures unhandled errors in server components, route handlers, and middleware.
 * Automatically called by Next.js when a request-level error occurs.
 */
export async function onRequestError(
  error: { digest: string } & Error,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string },
) {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(error, {
    tags: {
      method: request.method,
      path: request.path,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
    },
  });
}
