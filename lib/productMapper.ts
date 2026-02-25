import type { Product as CardProduct } from "@/components/shop/ProductCard";
import type { ProductDisplay } from "@/types/product";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/images";

/**
 * Maps ProductDisplay (API) to ProductCard format.
 * Uses product images when available; fallback to placeholder.
 * Also exposes a defaultVariantId (first variant) for grid add-to-cart.
 */
export function mapToCardProduct(product: ProductDisplay): CardProduct {
  const primaryImage = product.images?.[0]?.url?.trim()
    ? product.images[0].url.trim()
    : PLACEHOLDER_IMAGE_URL;
  const secondaryImage = product.images?.[1]?.url?.trim()
    ? product.images[1].url.trim()
    : undefined;
  const defaultVariantId = product.variants?.[0]?.id;

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
    defaultVariantId,
  };
}
