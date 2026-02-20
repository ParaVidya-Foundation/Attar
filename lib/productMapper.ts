import type { Product as CardProduct } from "@/components/shop/ProductCard";
import type { ProductRow } from "@/lib/fetchers";

/**
 * Maps database ProductRow to ProductCard format.
 * 
 * Rules:
 * - id: Use product.id (UUID) - required for cart/checkout
 * - title: Use product.name from database (single source of truth)
 * - image: Build from slug - `/products/${product.slug}.webp`
 * - slug: Pass through for href generation
 */
export function mapToCardProduct(product: ProductRow): CardProduct {
  return {
    id: product.id, // UUID from database (not slug!)
    title: product.name, // Database name (e.g., "Surya", "Chandra")
    price: product.price,
    originalPrice: product.original_price ?? undefined,
    images: {
      primary: `/products/${product.slug}.webp`, // Image path built from slug
    },
    href: `/product/${product.slug}`, // URL uses slug for SEO
    slug: product.slug, // Pass slug through for ProductCard component
    isSale: Boolean(product.original_price && product.original_price > product.price),
  };
}
