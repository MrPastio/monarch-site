import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale } from "@/lib/i18n";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { Safe } from "@/components/scenes/safe/safe";
import { Guard } from "@/components/scenes/guard/guard";
import { NightBand } from "@/components/scenes/night-band";
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
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede} />

      <Reveal as="section" className={styles.section}>
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.verdictTitle}
          </h2>
          <div className={styles.cards}>
            {copy.verdicts.map((verdict) => (
              <article key={verdict.id} className={styles.card} data-tone={verdict.id} data-reveal>
                <h3>{verdict.title}</h3>
                <p>{verdict.text}</p>
              </article>
            ))}
          </div>

          <h2 className={styles.h2} style={{ marginTop: "var(--s-9)" }} data-reveal>
            {copy.profilesTitle}
          </h2>
          <div className={styles.cards}>
            {copy.profiles.map((profile) => (
              <article key={profile.name} className={styles.card} data-reveal>
                <h3>{profile.name}</h3>
                <p>{profile.text}</p>
              </article>
            ))}
          </div>

          <div className={styles.cards} style={{ marginTop: "var(--s-7)" }}>
            <article className={styles.card} data-tone="deny" data-reveal>
              <h3>{dict.journey.hardLimitsTitle}</h3>
              <ul className={styles.list}>
                {dict.journey.hardLimits.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </Reveal>

      <NightBand>
        <Safe copy={dict.safe} agent={dict.ui.agent} />
        <Guard copy={dict.guard} events={dict.ui.events} />
      </NightBand>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.twoCol}`}>
          <div data-reveal>
            <h2 className={styles.h3}>{copy.updatesTitle}</h2>
            <p className={styles.text}>{copy.updatesText}</p>
          </div>
          <div data-reveal>
            <h2 className={styles.h3}>{copy.limitsTitle}</h2>
            <ul className={styles.list}>
              {copy.limits.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </>
  );
}
