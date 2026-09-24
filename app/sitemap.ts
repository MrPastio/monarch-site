import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { productUpdates } from "@/content/release-notes";

export const dynamic = "force-static";

const pages = ["", "download", "updates", "how-it-works", "security", "principles", "documentation"];

export default function sitemap(): MetadataRoute.Sitemap {
  const versions = productUpdates
    .filter((update) => update.status !== "draft")
    .map((update) => `updates/${update.version.replace(/\.0$/, "")}`);
  return locales.flatMap((lang) =>
    [...pages, ...versions].map((page) => ({
      url: `${siteUrl}/${lang}${page ? `/${page}` : ""}`,
      changeFrequency: page.startsWith("updates/") ? ("yearly" as const) : ("weekly" as const),
      priority: page === "" ? 1 : page === "download" ? 0.9 : 0.6,
      alternates: {
        languages: Object.fromEntries(locales.map((code) => [code, `${siteUrl}/${code}${page ? `/${page}` : ""}`])),
      },
    })),
  );
}
