export type ProductFeatureFlags = Readonly<
  Partial<{
    showIncenseTable: boolean;
  }>
>;

const EMPTY_FEATURES: ProductFeatureFlags = Object.freeze({});
const INCENSE_FEATURES: ProductFeatureFlags = Object.freeze({ showIncenseTable: true });

export const productFeatureMap: Record<string, ProductFeatureFlags> = {
  // Optional explicit overrides by slug can be added here.
};

export function getProductFeatures(slug: string | null | undefined): ProductFeatureFlags {
  if (!slug) return EMPTY_FEATURES;

  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return EMPTY_FEATURES;

  return productFeatureMap[normalizedSlug] ?? (normalizedSlug.includes("incense") ? INCENSE_FEATURES : EMPTY_FEATURES);
}
