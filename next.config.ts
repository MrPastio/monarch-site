import type { NextConfig } from "next";

/**
 * Two targets from one codebase:
 * - server (Vercel): proxy-based locale redirect, ISR, security headers;
 * - static export (GitHub Pages): STATIC_EXPORT=1, served under a base path.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const config: NextConfig = staticExport
  ? {
      output: "export",
      basePath: basePath || undefined,
      trailingSlash: true,
      reactStrictMode: true,
      poweredByHeader: false,
      images: { unoptimized: true },
    }
  : {
      reactStrictMode: true,
      poweredByHeader: false,
      images: { formats: ["image/avif", "image/webp"] },
      async redirects() {
        // Addresses from the previous site keep working.
        return [
          { source: "/:lang(ru|uk|en|bg)/architecture", destination: "/:lang/how-it-works", permanent: true },
          { source: "/:lang(ru|uk|en|bg)/control", destination: "/:lang/security", permanent: true },
          { source: "/:lang(ru|uk|en|bg)/capabilities/:path*", destination: "/:lang/how-it-works", permanent: true },
        ];
      },
      async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
      },
    };

export default config;
