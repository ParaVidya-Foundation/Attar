export type AttarSize = {
  ml: number;
  price: number;
};

export type AttarImage = {
  url: string;
  alt: string;
  unsplash_query?: string;
};

export type Attar = {
  id: string;
  slug: string;
  name: string;
  origin: string;
  notes: { opening: string[]; heart: string[]; base: string[] };
  zodiac: string[];
  planet: string;
  description: [string, string, string] | string[];
  sizes: AttarSize[];
  price: number;
  longevity: string;
  spiritual_benefits: string[];
  images: AttarImage[];
  badges: string[];
  stock: number;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  reading_time: string;
  tags: string[];
};

// Database-backed types
export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size_ml: number;
  price: number;
  sku: string | null;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  price: number;
  original_price: number | null;
  meta_title: string | null;
  meta_description: string | null;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type OrderItem = {
  variant_id: string;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string | null;
  status: string;
  amount: number;
  currency: string;
  razorpay_order_id: string | null;
  order_items?: Array<OrderItem & { price: number; product_id: string }>;
};
