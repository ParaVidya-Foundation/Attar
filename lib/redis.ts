/**
 * Upstash Redis helper — optional, for cache and rate limit
 * Only active when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
 */
let redisClient: {
  get: (k: string) => Promise<string | null>;
  set: (k: string, v: string, opts?: { ex?: number }) => Promise<void>;
} | null = null;

function initRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    // Lazy load — add @upstash/redis when using Redis
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis");
    return new Redis({ url, token }) as {
      get: (k: string) => Promise<string | null>;
      set: (k: string, v: string, opts?: { ex?: number }) => Promise<void>;
    };
  } catch {
    return null;
  }
}

export function getRedis() {
  if (!redisClient) redisClient = initRedis();
  return redisClient;
}
