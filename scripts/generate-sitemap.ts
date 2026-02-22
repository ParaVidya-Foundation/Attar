import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { BRAND, absoluteUrl } from "../lib/seo";
import blogs from "../data/blogs.json";

config({ path: ".env.local" });

type UrlEntry = { loc: string; lastmod?: string; changefreq?: string; priority?: number };

function xmlEscape(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildSitemap(urls: UrlEntry[]) {
  const body = urls
    .map((u) => {
      return [
        "<url>",
        `<loc>${xmlEscape(u.loc)}</loc>`,
        u.lastmod ? `<lastmod>${xmlEscape(u.lastmod)}</lastmod>` : "",
        u.changefreq ? `<changefreq>${xmlEscape(u.changefreq)}</changefreq>` : "",
        typeof u.priority === "number" ? `<priority>${u.priority.toFixed(1)}</priority>` : "",
        "</url>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
  );
}

async function main() {
  const urls: UrlEntry[] = [
    { loc: absoluteUrl("/home"), changefreq: "weekly", priority: 1.0 },
    { loc: absoluteUrl("/shop"), changefreq: "weekly", priority: 0.9 },
    { loc: absoluteUrl("/blog"), changefreq: "weekly", priority: 0.8 },
    { loc: absoluteUrl("/about"), changefreq: "yearly", priority: 0.3 },
    { loc: absoluteUrl("/policies"), changefreq: "yearly", priority: 0.2 },
    { loc: absoluteUrl("/zodiac"), changefreq: "monthly", priority: 0.5 },
    { loc: absoluteUrl("/planets"), changefreq: "monthly", priority: 0.5 },
    { loc: absoluteUrl("/cart"), changefreq: "weekly", priority: 0.2 },
    { loc: absoluteUrl("/account"), changefreq: "weekly", priority: 0.2 },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: products } = await supabase.from("products").select("slug").eq("is_active", true);
    for (const p of products ?? []) {
      urls.push({ loc: absoluteUrl(`/product/${p.slug}`), changefreq: "weekly", priority: 0.8 });
    }
  }

  for (const b of blogs)
    urls.push({ loc: absoluteUrl(`/blog/${b.slug}`), lastmod: b.date, changefreq: "monthly", priority: 0.6 });

  const sitemapXml = buildSitemap(urls);
  const publicDir = path.join(process.cwd(), "public");
  await writeFile(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? BRAND.url;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${base.replace(/\/+$/, "")}/sitemap.xml\n`;
  await writeFile(path.join(publicDir, "robots.txt"), robots, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
