/**
 * robots.txt — crawl rules and sitemap location.
 * Production: https://anandrasafragnance.com/sitemap.xml
 */
import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/account",
          "/checkout",
          "/cart",
          "/login",
          "/signup",
          "/order-success",
          "/scripts/",
        ],
      },
    ],
    sitemap: `${absoluteUrl("/sitemap.xml")}`,
  };
}
