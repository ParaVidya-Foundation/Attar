/**
 * Re-export product API and types for backward compatibility.
 * New code should import from @/lib/api/products and @/types/product.
 */
export {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductVariants,
} from "@/lib/api/products";
export type { ProductDisplay } from "@/types/product";
import type { ProductDisplay } from "@/types/product";
/** @deprecated Use ProductDisplay from @/types/product */
export type ProductWithRelations = ProductDisplay;
