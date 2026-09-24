import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // Addresses from the previous site keep working.
    return [
      { source: "/:lang(ru|uk|en|bg)/architecture", destination: "/:lang/how-it-works", permanent: true },
      { source: "/:lang(ru|uk|en|bg)/control", destination: "/:lang/security", permanent: true },
      { source: "/:lang(ru|uk|en|bg)/capabilities/:path*", destination: "/:lang/how-it-works", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/models/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default config;
