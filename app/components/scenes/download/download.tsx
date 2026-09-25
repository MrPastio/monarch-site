import Link from "next/link";
import type { Dict } from "@/content/dictionary";
import { getReleaseCatalog } from "@/lib/releases";
import { localePath, type Locale } from "@/lib/i18n";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { ReleaseCard } from "./release-card";
import { CrestStage } from "./crest-stage";
import { NightBand } from "@/components/scenes/night-band";
import styles from "./download.module.css";

export async function Download({ copy, locale, crestLabel }: { copy: Dict["download"]; locale: Locale; crestLabel: string }) {
  const catalog = await getReleaseCatalog();
  const current = catalog.current;
  const signed =
    catalog.stable.status === "ready" && catalog.stable.verification === "signed-manifest"
      ? `Ed25519 · ${catalog.stable.manifest.keyId}`
      : null;

  return (
    <NightBand>
      <Reveal as="section" className={styles.section} labelledBy="download-title" id="download">
        <div className="shell">
          <CrestStage label={crestLabel} />
          <ChapterHead id="download-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} align="center" />
        </div>
        <div className={`shell ${styles.grid}`}>
          <div className={styles.copy}>
            <dl className={styles.requirements} data-reveal>
              {copy.requirements.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.notes} data-reveal>
              <p>{copy.smartscreen}</p>
              <p>{copy.edge}</p>
            </div>
            <Link href={localePath(locale, "updates")} className={`btn btn-glass ${styles.all}`} data-reveal>
              {copy.all}
              <span className="arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
          <div data-reveal>
            {current?.asset ? (
              <ReleaseCard entry={current} signed={signed} copy={copy} locale={locale} />
            ) : (
              <p className={styles.unavailable}>
                {copy.unavailable}{" "}
                <a href="https://github.com/MrPastio/monarch-releases/releases" target="_blank" rel="noreferrer">
                  {copy.github} ↗
                </a>
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </NightBand>
  );
}
