export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export const PAID_STATUSES = ["paid", "shipped", "delivered"] as const;
export type PaidStatus = (typeof PAID_STATUSES)[number];

export function success<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ServiceResult<never> {
  return { ok: false, error };
}
