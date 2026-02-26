/**
 * Server-side structured logging. No console output in production.
 * Use in API routes, server components, server actions only.
 * Never expose internal errors, stack traces, or env to client.
 */
export function serverError(context: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  // Always keep server-side error logging enabled for production incident debugging.
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, msg);
}

export function serverWarn(context: string, message: string): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[${context}]`, message);
  }
}
