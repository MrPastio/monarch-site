import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localeMeta, localePath } from "@/lib/i18n";
import { getReleaseCatalog } from "@/lib/releases";
import { formatDate } from "@/lib/format";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import styles from "./updates.module.css";

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return { title: dict.pages.updates.title, description: dict.pages.updates.lede, alternates: { canonical: `/${lang}/updates` } };
}

export default async function UpdatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.updates;
  const stateLabels = {
    current: dict.pages.download.stateCurrent,
    archive: dict.pages.download.stateArchive,
    revoked: dict.pages.download.stateRevoked,
    history: dict.pages.download.stateHistory,
  };
  const catalog = await getReleaseCatalog();
  const intl = localeMeta[lang].intl;
  const entries = catalog.entries.filter((entry) => entry.notes);

  return (
    <>
      <PageHero kicker={dict.chrome.nav[3]!.label} title={copy.title} lede={copy.lede} />
      <Reveal as="section" className={styles.section}>
        <div className="shell">
          <ol className={styles.river}>
            <li className={styles.item} data-state="future" data-reveal>
              <span className={styles.node} aria-hidden />
              <div className={styles.card}>
                <p className={styles.meta}>
                  <span className={styles.badge}>{copy.future.label}</span>
                </p>
                <h2 className={styles.title}>{copy.future.title}</h2>
                <p className={styles.summary}>{copy.future.text}</p>
              </div>
            </li>
            {entries.map((entry) => {
              const notes = entry.notes!;
              const major = notes.scale === "major";
              return (
                <li key={entry.version} className={styles.item} data-state={entry.state} data-major={major} data-reveal>
                  <span className={styles.node} aria-hidden />
                  <Link href={localePath(lang, `updates/${entry.display}`)} className={styles.card}>
                    <p className={styles.meta}>
                      <span className={styles.version}>{entry.display}</span>
                      <span className={styles.badge}>{stateLabels[entry.state]}</span>
                      {entry.publishedAt && <time>{formatDate(entry.publishedAt, intl)}</time>}
                    </p>
                    <h2 className={styles.title}>{notes.title}</h2>
                    <p className={styles.summary}>{notes.summary}</p>
                    <p className={styles.tags}>
                      {notes.categories.map((category) => (
                        <span key={category}>{copy.categories[category]}</span>
                      ))}
                    </p>
                    <span className={styles.open}>
                      {copy.open} <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </Reveal>
    </>
  );
}
