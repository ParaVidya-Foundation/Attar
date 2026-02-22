/** next-sitemap — runs at postbuild to generate sitemap.xml in public/
 * Dynamic routes are also served by app/sitemap.ts (App Router).
 * This config is for static export or fallback; base URL matches production.
 */
module.exports = {
  siteUrl: "https://anandrasafragnance.com",
  generateRobotsTxt: true,
  exclude: ["/api/*", "/admin/*", "/login", "/signup", "/account/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/admin/", "/account/"] },
    ],
  },
};
