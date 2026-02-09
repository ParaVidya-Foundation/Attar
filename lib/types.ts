export type AttarSize = {
  ml: number;
  price: number;
};

export type AttarImage = {
  url: string;
  alt: string;
  unsplash_query: string;
};

export type Attar = {
  id: string;
  slug: string;
  name: string;
  origin: string;
  notes: { opening: string[]; heart: string[]; base: string[] };
  zodiac: string[];
  planet: string;
  description: [string, string, string];
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
  content: string; // Markdown
  category: string;
  author: string;
  date: string; // ISO
  reading_time: string;
  tags: string[];
};
