/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  turbopack: {
    // Ensure Turbopack treats this project directory as the root
    root: ".",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    // Prefer local images when you have them; remote is allowed for mocked content.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js inlines some styles; allow it but keep a strict baseline.
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS should only be enabled on HTTPS; keep it here for production deployments.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
