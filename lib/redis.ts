/**
 * Upstash Redis — optional. Used for rate limit, webhook idempotency, and optional caching.
 * Only active when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Do not throw; return null when Redis is unavailable.
 */
import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

function initRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export function getRedis(): Redis | null {
  if (!redisClient) redisClient = initRedis();
  return redisClient;
}

/** Key prefix for rate limit */
const RATE_LIMIT_PREFIX = "rl:";
/** Key prefix for webhook idempotency (e.g. payment.captured:order_xyz) */
const WEBHOOK_PREFIX = "wh:";
/** Key prefix for optional cache */
const CACHE_PREFIX = "cache:";

/**
 * Rate limit check using Redis (INCR + EXPIRE). Returns { allowed, remaining, resetAt }.
 * Use from rate-limit.ts when Redis is available.
 */
export async function rateLimitRedis(
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis();
  if (!redis) {
    return { allowed: true, remaining: maxRequests - 1, resetAt: Date.now() + windowSeconds * 1000 };
  }
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const resetAt = Date.now() + windowSeconds * 1000;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    const allowed = count <= maxRequests;
    return {
      allowed,
      remaining: Math.max(0, maxRequests - count),
      resetAt,
    };
  } catch {
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }
}

/**
 * Webhook idempotency: returns true if this event was already processed (skip duplicate).
 * Call with e.g. key = `payment.captured:${orderId}`. TTL in seconds (e.g. 86400 = 24h).
 */
export async function webhookSeen(key: string, ttlSeconds = 86400): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  const k = `${WEBHOOK_PREFIX}${key}`;
  try {
    const set = await redis.set(k, "1", { nx: true, ex: ttlSeconds });
    return set !== "OK";
  } catch {
    return false;
  }
}

/**
 * Optional cache get/set. Product list or blog list can use this with short TTL.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const v = await redis.get(`${CACHE_PREFIX}${key}`);
    return v as T | null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, exSeconds: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(`${CACHE_PREFIX}${key}`, value, { ex: exSeconds });
  } catch {
    // ignore
  }
}
