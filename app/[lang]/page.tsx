import { notFound } from "next/navigation";
import { Hero } from "@/components/scenes/hero/hero";
import { Release } from "@/components/scenes/release/release";
import { Hardware } from "@/components/scenes/hardware/hardware";
import { Abilities } from "@/components/scenes/abilities/abilities";
import { NightBand } from "@/components/scenes/night-band";
import { Safe } from "@/components/scenes/safe/safe";
import { Guard } from "@/components/scenes/guard/guard";
import { Max } from "@/components/scenes/max/max";
import { Download } from "@/components/scenes/download/download";
import { Faq } from "@/components/scenes/faq/faq";
import { getDict } from "@/content/dictionary";
import { isLocale, localeMeta } from "@/lib/i18n";
import { getReleaseCatalog } from "@/lib/releases";
import { formatBytes } from "@/lib/format";

export const revalidate = 900;

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const catalog = await getReleaseCatalog();
  const current = catalog.current;
  const release =
    current?.asset && current.state === "current"
      ? { url: current.asset.url, size: formatBytes(current.asset.size, localeMeta[lang].intl), display: current.display }
      : null;

  return (
    <>
      <Hero locale={lang} hero={dict.hero} journey={dict.journey} ui={dict.ui} release={release} />
      <Release copy={dict.release} />
      <Abilities copy={dict.abilities} />
      <Hardware copy={dict.hardware} />
      <NightBand id="protection">
        <Safe copy={dict.safe} agent={dict.ui.agent} />
        <Guard copy={dict.guard} events={dict.ui.events} />
      </NightBand>
      <Max copy={dict.max} />
      <Download copy={dict.download} locale={lang} crestLabel={dict.hero.crestLabel} steps={dict.hero.after.steps} />
      <Faq copy={dict.faq} />
    </>
  );
}
