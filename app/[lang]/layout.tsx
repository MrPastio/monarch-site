import "@fontsource-variable/onest/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../styles/base.css";

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { getDict, translatedLocales } from "@/content/dictionary";
import { isLocale, locales, localeMeta } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#08090a",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s — Monarch` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      type: "website",
      siteName: "Monarch",
      locale: localeMeta[lang].og,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: `/og/${lang === "ru" ? "ru" : "en"}.jpg`, width: 1200, height: 630, alt: dict.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [`/og/${lang === "ru" ? "ru" : "en"}.jpg`],
    },
    icons: { icon: "/icon.svg" },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);

  return (
    <html lang={lang} data-locale={lang}>
      <body>
        <a className="skip-link" href="#main">
          {dict.chrome.skip}
        </a>
        <SiteHeader locale={lang} chrome={dict.chrome} translated={translatedLocales} />
        <main id="main">{children}</main>
        <SiteFooter locale={lang} footer={dict.footer} />
      </body>
    </html>
  );
}
