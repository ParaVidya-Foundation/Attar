/**
 * Enterprise product types — single source of truth for product data.
 * Aligned with Supabase schema. Used by API layer and consumers.
 */

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean;
  featured: boolean;
  category_id: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size_ml: number;
  price: number;
  stock: number;
  sku: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

/** Nested shape from API (product + relations) */
export type ProductWithRelations = {
  product: Product;
  variants: ProductVariant[];
  images: ProductImage[];
};

/** Flattened display shape for pages/cards (backward compatible) */
export type ProductDisplay = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  images: { url: string }[];
  category_slug: string | null;
  variants: ProductVariant[];
  meta_title: string | null;
  meta_description: string | null;
  featured: boolean;
  is_active: boolean;
  created_at: string | null;
};
