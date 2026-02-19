import type { Product as CardProduct } from "@/components/shop/ProductCard";
import type { ProductRow } from "@/lib/fetchers";

export function mapToCardProduct(product: ProductRow): CardProduct {
  return {
    id: product.slug,
    title: product.name,
    price: product.price,
    originalPrice: product.original_price ?? undefined,
    images: {
      primary: `/products/${product.slug}.webp`,
    },
    href: `/product/${product.slug}`,
    isSale: Boolean(product.original_price && product.original_price > product.price),
  };
}
