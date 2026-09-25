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
  const toc = [
    ...copy.sections.map((section) => ({ href: `#${section.id}`, label: section.title })),
    { href: "#trouble", label: copy.troubleTitle },
    { href: "#faq", label: dict.faq.title },
  ];

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede} home={localePath(lang)}>
        <div className={styles.docHeroCta}>
          <Link className="btn btn-primary btn-lg" href={localePath(lang, "download")}>
            {dict.hero.primary}
          </Link>
          <p>{dict.download.requirements.map((item) => item.value).join(" · ")}</p>
        </div>
      </PageHero>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.docLayout}`}>
          <nav className={styles.toc} aria-label={copy.toc}>
            <p className={styles.tocTitle}>{copy.toc}</p>
            {toc.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.docSections}>
            {copy.sections.map((section) => (
              <article key={section.id} id={section.id} className={`card ${styles.docSection}`} data-reveal>
                <h2 className={styles.h3}>{section.title}</h2>
                <ol className={styles.steps}>
                  {section.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}

            <div id="trouble" className={styles.docTrouble} data-reveal>
              <h2 className={styles.h3}>{copy.troubleTitle}</h2>
              <div className={styles.cards} style={{ marginTop: "var(--s-4)" }}>
                {copy.trouble.map((item) => (
                  <article key={item.q} className={styles.card}>
                    <h3>{item.q}</h3>
                    <p>{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div id="faq">
        <Faq copy={dict.faq} />
      </div>
    </>
  );
}
