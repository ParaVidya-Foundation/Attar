/**
 * Dynamic sitemap generation for Next.js App Router
 * Fetches products and blog posts from Supabase and generates sitemap.xml
 * Uses getSiteUrl() — production: https://anandrasafragnance.com
 */
import { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo";
import { getCategories } from "@/lib/fetchers";
import { getBlogSlugsWithUpdated, getAllBlogCategorySlugs, getAllBlogTagSlugs } from "@/lib/blog";

export const revalidate = 3600;

async function getProducts() {
  try {
    const supabase = createStaticClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // absoluteUrl() uses getSiteUrl() internally

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/home"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/shop"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/collections/planets"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/collections/zodiac"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/collections/Incense"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/collections/nakshatra"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/collections/Chakra-attar"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/collections/stress"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/collections/Love-attar"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/gift-sets"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/find-fragrance"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/faq"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/bulk-enquiry"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/policies"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/refund"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic product pages
  const products = await getProducts();
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Blog post pages (/blog already in staticPages)
  const [blogPosts, blogCategorySlugs, blogTagSlugs] = await Promise.all([
    getBlogSlugsWithUpdated(),
    getAllBlogCategorySlugs(),
    getAllBlogTagSlugs(),
  ]);
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogCategoryPages: MetadataRoute.Sitemap = blogCategorySlugs.map((slug) => ({
    url: absoluteUrl(`/blog/category/${slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const blogTagPages: MetadataRoute.Sitemap = blogTagSlugs.map((slug) => ({
    url: absoluteUrl(`/blog/tag/${slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Category pages (/category/[slug])
  const categories = await getCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/category/${c.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...blogPostPages,
    ...blogCategoryPages,
    ...blogTagPages,
  ];
}
