import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale } from "@/lib/i18n";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { asset } from "@/lib/asset";
import styles from "../prose.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getDict(lang).pages.principles;
  return { title: copy.title, description: copy.lede, alternates: { canonical: `/${lang}/principles` } };
}

export default async function PrinciplesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = getDict(lang).pages.principles;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede} />

      {[
        { title: copy.designTitle, items: copy.design },
        { title: copy.qualityTitle, items: copy.quality },
      ].map((group) => (
        <Reveal as="section" className={styles.section} key={group.title}>
          <div className={`shell ${styles.split}`}>
            <h2 className={styles.h2} data-reveal>
              {group.title}
            </h2>
            <div className={styles.cards} style={{ marginTop: 0 }}>
              {group.items.map((item) => (
                <article key={item.title} className={styles.card} data-reveal>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      ))}

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.split}`}>
          <h2 className={styles.h2} data-reveal>
            {copy.agentsTitle}
          </h2>
          <div data-reveal>
            <p className={styles.bigText}>{copy.agentsText}</p>
            <p className={styles.source}>
              <a href="https://github.com/MrPastio/monarch/blob/main/SECURITY.md" target="_blank" rel="noreferrer">
                {copy.agentsSource} ↗
              </a>
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section}>
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.brandTitle}
          </h2>
          <p className={styles.text} data-reveal>
            {copy.brandText}
          </p>
          <div className={styles.brand}>
            <figure data-reveal>
              <Image src={asset("/brand/logo-dark.webp")} alt={copy.brandDark} width={960} height={960} sizes="(max-width: 800px) 100vw, 50vw" />
              <figcaption>{copy.brandDark}</figcaption>
            </figure>
            <figure data-reveal>
              <Image src={asset("/brand/logo-light.webp")} alt={copy.brandLight} width={960} height={960} sizes="(max-width: 800px) 100vw, 50vw" />
              <figcaption>{copy.brandLight}</figcaption>
            </figure>
          </div>
        </div>
      </Reveal>
    </>
  );
}
