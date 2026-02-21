import type { Product as CardProduct } from "@/components/shop/ProductCard";
import type { ProductDisplay } from "@/types/product";

/**
 * Maps ProductDisplay (API) to ProductCard format.
 * Uses product images when available; fallback to /products/{slug}.webp.
 * Cart receives product_id (id), variant_id from selection, price, name, image.
 */
export function mapToCardProduct(product: ProductDisplay): CardProduct {
  const primaryImage = product.images?.[0]?.url ?? `/products/${product.slug}.webp`;
  const secondaryImage = product.images?.[1]?.url;
  return {
    id: product.id,
    title: product.name,
    price: product.price,
    originalPrice: product.original_price ?? undefined,
    images: {
      primary: primaryImage,
      ...(secondaryImage ? { secondary: secondaryImage } : {}),
    },
    href: `/product/${product.slug}`,
    slug: product.slug,
    isSale: Boolean(product.original_price && product.original_price > product.price),
  };
}
