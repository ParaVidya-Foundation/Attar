import type { Metadata } from "next";
import type { Attar, BlogPost } from "./types";
import { getSiteUrl } from "@/lib/env";
import { SEO_CONFIG } from "@/lib/seo-config";

/** Logo and favicon path (place anand-rasa-logo-black.png in public/) */
export const LOGO_PATH = "/anand-rasa-logo-black.png";

export const BRAND = {
  name: "Anand Ras",
  nameSeo: SEO_CONFIG.siteName,
  description:
    "India's astrology-inspired fragrance house. Handcrafted luxury attars, zodiac perfume oils, planet fragrances, agarbatti & spiritual incense — alcohol-free, made in India.",
  homeTitle: "Spiritual Attars, Zodiac Perfumes & Agarbatti | Anand Rasa Fragrance",
  homeDescription: SEO_CONFIG.defaultDescription,
  url: SEO_CONFIG.domain,
  locale: SEO_CONFIG.locale,
  ogImage: SEO_CONFIG.defaultOgImage,
} as const;

/** Organization JSON-LD (site-wide) */
export function organizationJsonLd() {
  const url = absoluteUrl("/");
  const logo = absoluteUrl("/anand-rasa-logo-black.png");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.nameSeo,
    url: url.replace(/\/+$/, ""),
    logo,
    description: "India's astrology-inspired fragrance house — handcrafted attars, zodiac perfumes, planet perfume oils, agarbatti, and spiritual incense.",
    email: "anandrasafragnance@gmail.com",
    telephone: "+919311336643",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/anand__rasa/",
      "https://www.facebook.com/profile.php?id=61584373649018",
      "https://www.youtube.com/@anandrasafragnance",
    ],
  };
}

/** WebSite JSON-LD with SearchAction */
export function websiteJsonLd() {
  const base = absoluteUrl("/").replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: base,
    name: BRAND.nameSeo,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${base}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function absoluteUrl(p: string): string {
  let base: string;
  try {
    base = getSiteUrl();
  } catch {
    base = BRAND.url;
  }
  const normalized = base.replace(/\/+$/, "");
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${normalized}${path}`;
}

export function pageMetadata(args: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(args.path);
  const image = args.ogImage ?? BRAND.ogImage;
  const title = args.title;

  return {
    title,
    description: args.description,
    alternates: { canonical: url },
    ...(args.keywords?.length ? { keywords: args.keywords } : {}),
    openGraph: {
      type: args.type === "article" ? "article" : "website",
      title,
      description: args.description,
      url,
      siteName: BRAND.nameSeo,
      locale: BRAND.locale,
      images: [{ url: image, width: 1200, height: 630, alt: args.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: args.description,
      images: [image],
    },
  };
}

export function productJsonLd(attar: Attar) {
  const url = absoluteUrl(`/product/${attar.slug}`);
  const image = attar.images[0]?.url ?? BRAND.ogImage;
  const lowPrice = Math.min(...attar.sizes.map((s) => s.price));
  const highPrice = Math.max(...attar.sizes.map((s) => s.price));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: attar.name,
    description: attar.description.join("\n\n"),
    brand: { "@type": "Brand", name: BRAND.name },
    category: "Attar / Natural Perfume Oil",
    image: [image],
    url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice,
      highPrice,
      offerCount: attar.sizes.length,
      availability: "https://schema.org/InStock",
      url,
    },
  };
}

export function articleJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: BRAND.name },
    publisher: { "@type": "Organization", name: BRAND.name },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: url,
    url,
  };
}

/** Article JSON-LD for DB-backed blog post (slug, title, excerpt, published_at, updated_at, author_name, cover_image) */
export function articleJsonLdFromRow(post: {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  cover_image: string | null;
}) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const image = post.cover_image
    ? (post.cover_image.startsWith("http") ? post.cover_image : absoluteUrl(post.cover_image))
    : BRAND.ogImage;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    author: { "@type": "Person", name: post.author_name ?? BRAND.name },
    publisher: { "@type": "Organization", name: BRAND.name, logo: { "@type": "ImageObject", url: absoluteUrl("/anand-rasa-logo-black.png") } },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    mainEntityOfPage: url,
    url,
    image,
    inLanguage: "en-IN",
  };
}

/** BreadcrumbList JSON-LD (product/category pages) */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = absoluteUrl("/").replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function itemListJsonLd(items: { name: string; path: string }[]) {
  const base = absoluteUrl("/").replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${base}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}
