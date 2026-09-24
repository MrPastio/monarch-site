import { notFound } from "next/navigation";
import { Hero } from "@/components/scenes/hero/hero";
import { Hardware } from "@/components/scenes/hardware/hardware";
import { Journey } from "@/components/scenes/journey/journey";
import { Safe } from "@/components/scenes/safe/safe";
import { Guard } from "@/components/scenes/guard/guard";
import { Max } from "@/components/scenes/max/max";
import { Facts } from "@/components/scenes/facts/facts";
import { Download } from "@/components/scenes/download/download";
import { Faq } from "@/components/scenes/faq/faq";
import { getDict } from "@/content/dictionary";
import { isLocale, localeMeta } from "@/lib/i18n";

export const revalidate = 900;

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);

  return (
    <>
      <Hero locale={lang} hero={dict.hero} />
      <Hardware copy={dict.hardware} />
      <Journey copy={dict.journey} ui={dict.ui} />
      <Safe copy={dict.safe} agent={dict.ui.agent} />
      <Guard copy={dict.guard} events={dict.ui.events} />
      <Max copy={dict.max} />
      <Facts copy={dict.facts} locale={localeMeta[lang].intl} />
      <Download copy={dict.download} locale={lang} />
      <Faq copy={dict.faq} />
    </>
  );
}
