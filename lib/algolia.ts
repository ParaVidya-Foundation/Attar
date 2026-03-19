/**
 * Algolia search — server-side indexing and client-safe search.
 * Uses algoliasearch v5. Only active when ALGOLIA_APP_ID is set.
 *
 * Indexing functions (indexProducts, removeProducts, configureIndex) require
 * ALGOLIA_ADMIN_KEY and must run server-side only.
 *
 * searchProducts uses ALGOLIA_SEARCH_KEY (falls back to admin key).
 */
import { algoliasearch } from "algoliasearch";
import type { SearchResponse } from "algoliasearch";

export type AlgoliaProductRecord = {
  objectID: string;
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
};

export type IndexableProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
};

function requireEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

function getIndexName(): string {
  return process.env.ALGOLIA_INDEX_NAME ?? "products";
}

function getAdminClient() {
  return algoliasearch(requireEnvVar("ALGOLIA_APP_ID"), requireEnvVar("ALGOLIA_ADMIN_KEY"));
}

function getSearchClient() {
  return algoliasearch(
    requireEnvVar("ALGOLIA_APP_ID"),
    process.env.ALGOLIA_SEARCH_KEY ?? requireEnvVar("ALGOLIA_ADMIN_KEY"),
  );
}

/**
 * Index an array of products into Algolia.
 * Server-side only (requires admin key).
 *
 * @example
 * ```ts
 * import { indexProducts } from "@/lib/algolia";
 *
 * await indexProducts([
 *   { id: "1", name: "Rose Attar", price: 1200, category: "floral", description: "Pure rose", image: "https://..." },
 * ]);
 * ```
 */
export async function indexProducts(products: IndexableProduct[]): Promise<void> {
  if (products.length === 0) return;

  const client = getAdminClient();
  const indexName = getIndexName();

  const objects: AlgoliaProductRecord[] = products.map((p) => ({
    objectID: p.id,
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image ?? "",
    category: p.category ?? "",
    description: p.description ?? "",
  }));

  await client.saveObjects({ indexName, objects });
}

/**
 * Search products in Algolia. Safe for API routes (uses search-only key).
 *
 * @example
 * ```ts
 * import { searchProducts } from "@/lib/algolia";
 *
 * const { hits, nbHits } = await searchProducts("rose", { hitsPerPage: 10 });
 * ```
 */
export async function searchProducts(
  query: string,
  options?: { hitsPerPage?: number; page?: number; filters?: string },
): Promise<{
  hits: AlgoliaProductRecord[];
  nbHits: number;
  nbPages: number;
  page: number;
}> {
  const client = getSearchClient();
  const indexName = getIndexName();

  const { results } = await client.search<AlgoliaProductRecord>({
    requests: [
      {
        indexName,
        query,
        hitsPerPage: options?.hitsPerPage ?? 20,
        page: options?.page ?? 0,
        ...(options?.filters ? { filters: options.filters } : {}),
      },
    ],
  });

  const result = results[0] as SearchResponse<AlgoliaProductRecord>;

  return {
    hits: result.hits,
    nbHits: result.nbHits ?? 0,
    nbPages: result.nbPages ?? 0,
    page: result.page ?? 0,
  };
}

/**
 * Remove products from the Algolia index by their IDs.
 * Server-side only (requires admin key).
 */
export async function removeProducts(productIds: string[]): Promise<void> {
  if (productIds.length === 0) return;

  const client = getAdminClient();
  const indexName = getIndexName();

  await client.deleteObjects({ indexName, objectIDs: productIds });
}

/**
 * Configure searchable attributes, facets, and ranking for the products index.
 * Run once during initial setup or when index settings change.
 * Server-side only (requires admin key).
 *
 * @example
 * ```ts
 * import { configureIndex } from "@/lib/algolia";
 * await configureIndex();
 * ```
 */
export async function configureIndex(): Promise<void> {
  const client = getAdminClient();
  const indexName = getIndexName();

  await client.setSettings({
    indexName,
    indexSettings: {
      searchableAttributes: ["name", "description", "category"],
      attributesForFaceting: ["category", "filterOnly(price)"],
      customRanking: ["desc(price)"],
    },
  });
}
