export type ProductFeatureFlags = Readonly<
  Partial<{
    showIncenseTable: boolean;
    showFAQincense: boolean;
    showDiscountPoster: boolean;
    showStressUse: boolean;
    showFindProduct: boolean;
  }>
>;

const EMPTY_FEATURES: ProductFeatureFlags = Object.freeze({});
const INCENSE_FEATURES: ProductFeatureFlags = Object.freeze({
  showIncenseTable: true,
  showFAQincense: true,
  showDiscountPoster: true,
});
const STRESS_FEATURES: ProductFeatureFlags = Object.freeze({
  showStressUse: true,
});
const ASTRO_FEATURES: ProductFeatureFlags = Object.freeze({
  showFindProduct: true,
});

export const productFeatureMap: Record<string, ProductFeatureFlags> = {
  // Optional explicit overrides by product slug can be added here.
};

export function getProductFeatures(
  slug: string | null | undefined,
  categorySlug?: string | null | undefined,
): ProductFeatureFlags {
  const normalizedSlug = slug?.trim().toLowerCase() ?? "";
  const normalizedCategorySlug = categorySlug?.trim().toLowerCase() ?? "";

  if (!normalizedSlug && !normalizedCategorySlug) return EMPTY_FEATURES;

  if (normalizedCategorySlug === "stress-relief-attar") {
    return STRESS_FEATURES;
  }

  if (normalizedCategorySlug === "incense-sticks") {
    return INCENSE_FEATURES;
  }

  if (
    normalizedCategorySlug === "planets" ||
    normalizedCategorySlug === "planet-attar" ||
    normalizedCategorySlug === "zodiac" ||
    normalizedCategorySlug === "zodiac-attar" ||
    normalizedCategorySlug === "nakshatra" ||
    normalizedCategorySlug === "nakshatra-attar"
  ) {
    return ASTRO_FEATURES;
  }

  if (!normalizedSlug) return EMPTY_FEATURES;
  return (
    productFeatureMap[normalizedSlug] ??
    (normalizedSlug.includes("incense") ? INCENSE_FEATURES : EMPTY_FEATURES)
  );
}
