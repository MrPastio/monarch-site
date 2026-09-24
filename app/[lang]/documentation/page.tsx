import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localePath } from "@/lib/i18n";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Faq } from "@/components/scenes/faq/faq";
import styles from "../prose.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getDict(lang).pages.docs;
  return { title: copy.title, description: copy.lede, alternates: { canonical: `/${lang}/documentation` } };
}

export default async function DocsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.docs;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede}>
        <Link className="btn btn-primary btn-lg" href={localePath(lang, "download")}>
          {dict.hero.primary}
        </Link>
      </PageHero>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.docGrid}`}>
          {copy.sections.map((section) => (
            <div key={section.id} id={section.id} data-reveal>
              <h2 className={styles.h3}>{section.title}</h2>
              <ol className={styles.steps}>
                {section.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section}>
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.troubleTitle}
          </h2>
          <div className={styles.cards}>
            {copy.trouble.map((item) => (
              <article key={item.q} className={styles.card} data-reveal>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      <Faq copy={dict.faq} />
    </>
  );
}
