/**
 * Server-side structured logging. No console output in production.
 * Use in API routes, server components, server actions only.
 * Never expose internal errors, stack traces, or env to client.
 */
const isProd = process.env.NODE_ENV === "production";

export function serverError(context: string, err: unknown): void {
  if (isProd) return;
  const msg = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, msg);
}

export function serverWarn(context: string, message: string): void {
  if (isProd) return;
  // eslint-disable-next-line no-console
  console.warn(`[${context}]`, message);
}
