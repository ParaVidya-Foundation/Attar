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
  id: number;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
};

export type ProductSize = {
  id: number;
  product_id: string;
  size_ml: number;
  price: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  origin: string | null;
  notes: Record<string, string[]> | null;
  zodiac: string[];
  planet: string | null;
  longevity: string | null;
  spiritual_benefits: string[];
  badges: string[];
  price: number;
  currency: string;
  meta_title: string | null;
  meta_description: string | null;
  product_images?: ProductImage[];
  product_sizes?: ProductSize[];
};

export type OrderItem = {
  productId: string;
  size_ml: number;
  qty: number;
};

export type Order = {
  id: string;
  user_id: string | null;
  status: string;
  total_amount: number;
  currency: string;
  razorpay_order_id: string | null;
  order_items?: Array<OrderItem & { unit_price: number }>;
};
