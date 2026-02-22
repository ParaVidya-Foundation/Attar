/**
 * Dynamic sitemap generation for Next.js App Router
 * Fetches products and blog posts from Supabase and generates sitemap.xml
 * Uses getSiteUrl() — production: https://anandrasafragnance.com
 */
import { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/seo";
import { getBlogSlugsWithUpdated } from "@/lib/blog";

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

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/shop"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/collections/planets"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/collections/zodiac"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/collections/Incense"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/policies"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
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
  const blogPosts = await getBlogSlugsWithUpdated();
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...blogPostPages];
}
