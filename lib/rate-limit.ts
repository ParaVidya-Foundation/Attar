/**
 * Rate limiter for API routes. Uses Redis (Upstash) when available, else in-memory.
 * Order creation throttle, webhook protection, and general API limits.
 */
import { rateLimitRedis } from "@/lib/redis";

type RateLimitStore = Map<string, { count: number; resetAt: number }>;

const store: RateLimitStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

function rateLimitMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(identifier);
  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Async rate limit: uses Redis (Upstash) when available, else in-memory. Do not break existing logic.
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { getRedis } = await import("@/lib/redis");
  if (!getRedis()) {
    return rateLimitMemory(identifier, maxRequests, windowMs);
  }
  const windowSeconds = Math.ceil(windowMs / 1000);
  return rateLimitRedis(identifier, maxRequests, windowSeconds);
}

/** Synchronous in-memory fallback for callers that cannot await (use rateLimit when possible). */
export function rateLimitSync(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  return rateLimitMemory(identifier, maxRequests, windowMs);
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
