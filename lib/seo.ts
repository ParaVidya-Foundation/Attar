import type { Metadata } from "next";
import type { Attar, BlogPost } from "./types";

export const BRAND = {
  name: "Anand Ras",
  description:
    "Anand Ras is a heritage Indian luxury attar house—minimal, airy, cream-toned design with royal depth. Explore alcohol-free perfume oils crafted for calm, skin-close elegance.",
  url: "https://anandras.example",
  locale: "en_IN",
  ogImage: "https://images.unsplash.com/photo-1526045431048-f857369baa09?auto=format&fit=crop&w=1200&q=80",
} as const;

export function absoluteUrl(p: string): string {
  const base =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SITE_URL) ||
    BRAND.url;
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
}): Metadata {
  const url = absoluteUrl(args.path);
  const image = args.ogImage ?? BRAND.ogImage;
  const title = `${args.title} — ${BRAND.name}`;

  return {
    title,
    description: args.description,
    alternates: { canonical: args.path },
    openGraph: {
      type: args.type === "article" ? "article" : "website",
      title,
      description: args.description,
      url,
      siteName: BRAND.name,
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
      availability: attar.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url,
    },
  };
}

export function articleJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
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
