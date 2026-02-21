/**
 * DB category slugs for collection pages. Use these before querying getProductsByCategory
 * to avoid "category not found" errors.
 */
export const COLLECTION_SLUGS = {
  planets: "planet-attar",
  zodiac: "zodiac-attar",
  incense: "incense-sticks",
  stress: "stress-relief-attar",
  gifts: "gift-sets",
} as const;

export type CollectionKey = keyof typeof COLLECTION_SLUGS;
