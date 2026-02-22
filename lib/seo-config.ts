/**
 * Central SEO config — title template, default description, domain, OpenGraph, Twitter.
 * Used by lib/seo.ts and by pages for dynamic metadata.
 * Domain: https://anandrasafragnance.com
 */

export const SEO_CONFIG = {
  /** Canonical domain (no trailing slash) */
  domain: "https://anandrasafragnance.com",

  /** Title template for all pages: "%s — Anand Ras" */
  titleTemplate: "%s — Anand Ras",

  /** Default meta description when page-specific one is not set */
  defaultDescription:
    "Premium alcohol-free attars inspired by Vedic tradition — meditation & puja fragrances, handcrafted in India.",

  /** OpenGraph default locale */
  locale: "en_IN" as const,

  /** Default OG/Twitter image URL */
  defaultOgImage:
    "https://images.unsplash.com/photo-1526045431048-f857369baa09?auto=format&fit=crop&w=1200&q=80",

  /** Twitter card type */
  twitterCard: "summary_large_image" as const,

  /** Site name for OpenGraph */
  siteName: "Anand Rasa Fragrance",

  /** Application name for metadata */
  applicationName: "Anand Rasa Fragrance",
} as const;
