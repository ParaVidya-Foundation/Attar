import type { ProductDisplay } from "@/types/product";
import type { AstroApiResponse, AstrologyCalculationResult } from "@/lib/types/astrology";
import { buildAstroApiResponse } from "@/lib/astrology/recommendations";

/**
 * Backward-compatible wrapper. Product list is now queried server-side from Supabase,
 * so the `products` argument is ignored.
 */
export async function enrichAstrologyResponse(
  astrology: AstrologyCalculationResult,
  // kept for compatibility with older call sites
  _products?: ProductDisplay[],
): Promise<AstroApiResponse> {
  return buildAstroApiResponse(astrology);
}
