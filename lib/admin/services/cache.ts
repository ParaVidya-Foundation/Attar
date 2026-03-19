import { cacheInvalidate } from "@/lib/redis";

const ADMIN_CACHE_KEYS = [
  "admin:stats",
  "admin:analytics",
] as const;

export async function invalidateAdminCaches(): Promise<void> {
  await Promise.allSettled(ADMIN_CACHE_KEYS.map((key) => cacheInvalidate(key)));
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await cacheInvalidate("admin:analytics");
  await cacheInvalidate("admin:stats");
}
