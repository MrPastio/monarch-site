import { notFound } from "next/navigation";
import { Hero } from "@/components/scenes/hero/hero";
import { getDict } from "@/content/dictionary";
import { isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);

  return (
    <>
      <Hero locale={lang} hero={dict.hero} />
      <section style={{ height: "120vh" }} aria-hidden />
    </>
  );
}
