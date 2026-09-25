import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localePath } from "@/lib/i18n";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Safe } from "@/components/scenes/safe/safe";
import { Guard } from "@/components/scenes/guard/guard";
import { NightBand } from "@/components/scenes/night-band";
import { AccessModes } from "@/components/scenes/access/access-modes";
import styles from "../prose.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getDict(lang).pages.security;
  return { title: copy.title, description: copy.lede, alternates: { canonical: `/${lang}/security` } };
}

export default async function SecurityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.security;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede} home={localePath(lang)} jumps={copy.jumps} jumpsLabel={dict.ui.jumpsLabel} />

      <Reveal as="section" className={styles.section} id="verdicts">
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.verdictTitle}
          </h2>
          <div className={styles.cards}>
            {copy.verdicts.map((verdict) => (
              <article key={verdict.id} className={`${styles.card} ${styles.verdictCard}`} data-tone={verdict.id} data-reveal>
                <h3>{verdict.title}</h3>
                <p>{verdict.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section} id="access">
        <div className="shell">
          <div data-reveal>
            <AccessModes copy={dict.access} lanes={dict.journey.lanes} />
          </div>
          <div className={`night ${styles.hardLimits}`} data-reveal>
            <p className="kicker">{dict.journey.hardLimitsTitle}</p>
            <ul className={styles.list}>
              {dict.journey.hardLimits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <NightBand id="protection">
        <Safe copy={dict.safe} agent={dict.ui.agent} indexed={false} />
        <Guard copy={dict.guard} events={dict.ui.events} indexed={false} />
      </NightBand>

      <Reveal as="section" className={styles.section} id="updates">
        <div className="shell">
          <div className={styles.split}>
            <h2 className={styles.h2} data-reveal>
              {copy.updatesTitle}
            </h2>
            <p className={styles.bigText} data-reveal>
              {copy.updatesText}
            </p>
          </div>
          <ol className={styles.chain}>
            {copy.updateSteps.map((step, index) => (
              <li key={step.title} data-reveal>
                <span className={styles.chainIndex}>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.split}`}>
          <h2 className={styles.h2} data-reveal>
            {copy.limitsTitle}
          </h2>
          <ul className={styles.list} data-reveal>
            {copy.limits.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </div>
      </Reveal>
    </>
  );
}
