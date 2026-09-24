/**
 * Public origin of the site. Vercel sets VERCEL_PROJECT_PRODUCTION_URL on
 * every deployment; locally the dev server origin is used.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4477";
