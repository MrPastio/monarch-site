import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localePath } from "@/lib/i18n";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ProcessStack } from "@/components/illustration/process-stack";
import { PathMap } from "@/components/scenes/path-map/path-map";
import styles from "../prose.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getDict(lang).pages.how;
  return { title: copy.title, description: copy.lede, alternates: { canonical: `/${lang}/how-it-works` } };
}

export default async function HowPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.how;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede} />

      <Reveal as="section" className={styles.section}>
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.processTitle}
          </h2>
          <div className={styles.block}>
            <ProcessStack layers={copy.processes} />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.split}`}>
          <h2 className={styles.h2} data-reveal>
            {copy.kernelTitle}
          </h2>
          <p className={styles.bigText} data-reveal>
            {copy.kernelText}
          </p>
        </div>
      </Reveal>

      <PathMap copy={dict.journey} verdicts={dict.pages.security.verdicts} />

      <Reveal as="section" className={styles.section}>
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.modulesTitle}
          </h2>
          <ul className={styles.modules}>
            {copy.modules.map((module, index) => (
              <li key={module.id} data-reveal style={{ "--i": index } as React.CSSProperties}>
                <code>{module.id}</code>
                <h3>{module.name}</h3>
                <p>{module.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.twoCol}`}>
          <div data-reveal>
            <h2 className={styles.h3}>{copy.modelsTitle}</h2>
            <p className={styles.text}>{copy.modelsText}</p>
            <Link className={`btn btn-glass ${styles.cta}`} href={localePath(lang, "documentation")}>
              {dict.chrome.nav[4]!.label} →
            </Link>
          </div>
          <div data-reveal>
            <h2 className={styles.h3}>{copy.memoryTitle}</h2>
            <p className={styles.text}>{copy.memoryText}</p>
          </div>
        </div>
      </Reveal>
    </>
  );
}
