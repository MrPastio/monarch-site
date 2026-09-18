import { notFound } from "next/navigation";
import { getCopy } from "../content";
import { isLocale } from "../content/types";
import { getNormalizedStableRelease } from "../lib/stable-release";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { MobileActionBar } from "../components/mobile-action-bar";
import { Hero } from "../components/sections/hero";
import { Facts } from "../components/sections/facts";
import { Story } from "../components/sections/story";
import { Capabilities } from "../components/sections/capabilities";
import { Boundaries } from "../components/sections/boundaries";
import { Rough } from "../components/sections/rough";
import { NextUp } from "../components/sections/next-up";
import { Download } from "../components/sections/download";
import { Faq } from "../components/sections/faq";

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const copy = getCopy(lang);
  const release = await getNormalizedStableRelease();

  return (
    <>
      <a className="skip-link" href="#main">
        К основному содержанию
      </a>
      <SiteHeader copy={copy} />
      <main id="main">
        <Hero copy={copy} release={release} />
        <Facts copy={copy} />
        <Story copy={copy} />
        <Capabilities copy={copy} />
        <Boundaries copy={copy} />
        <Rough copy={copy} />
        <NextUp copy={copy} />
        <Download copy={copy} release={release} />
        <Faq copy={copy} />
      </main>
      <SiteFooter copy={copy} lang={lang} />
      <MobileActionBar copy={copy} />
    </>
  );
}
