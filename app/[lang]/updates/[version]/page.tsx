import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localeMeta, localePath, locales } from "@/lib/i18n";
import { findCatalogEntry, getReleaseCatalog } from "@/lib/releases";
import { productUpdates } from "@/content/release-notes";
import { formatBytes, formatDate } from "@/lib/format";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ArchiveList } from "@/components/page/archive-list";
import { VersionTabs } from "@/components/page/version-tabs";
import styles from "./version.module.css";

export const revalidate = 900;

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    productUpdates
      .filter((update) => update.status !== "draft")
      .map((update) => ({ lang, version: update.version.replace(/\.0$/, "") })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; version: string }> }): Promise<Metadata> {
  const { lang, version } = await params;
  if (!isLocale(lang)) return {};
  const catalog = await getReleaseCatalog();
  const entry = findCatalogEntry(catalog, version);
  if (!entry?.notes) return {};
  return {
    title: `${entry.display} · ${entry.notes.title}`,
    description: entry.notes.summary,
    alternates: { canonical: `/${lang}/updates/${entry.display}` },
  };
}

export default async function VersionPage({ params }: { params: Promise<{ lang: string; version: string }> }) {
  const { lang, version } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.updates;
  const dl = dict.pages.download;
  const catalog = await getReleaseCatalog();
  const entry = findCatalogEntry(catalog, version);
  if (!entry?.notes) notFound();
  const notes = entry.notes;
  const intl = localeMeta[lang].intl;
  const patchRows = entry.patches.map((build) => ({ ...build, title: null, reason: null }));

  const notesBody = (
    <>
            {notes.status === "withdrawn" && (
              <div className={styles.withdrawn} data-reveal>
                <p className="kicker">{copy.withdrawnTitle}</p>
                <p>{notes.withdrawal.reason}</p>
                {notes.withdrawal.supersededBy && (
                  <Link href={localePath(lang, `updates/${notes.withdrawal.supersededBy}`)}>
                    {copy.supersededBy}: {notes.withdrawal.supersededBy} →
                  </Link>
                )}
              </div>
            )}

            <h2 className={styles.h2} data-reveal>
              {copy.whatChanged}
            </h2>
            <ol className={styles.changes}>
              {notes.changes.map((change, index) => (
                <li key={change.title} data-reveal>
                  <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{change.title}</h3>
                    <p>{change.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            {notes.spotlight && (
              <div className={styles.spotlight} data-reveal>
                <p className={styles.statement}>{notes.spotlight.statement}</p>
                <div className={styles.flow}>
                  {notes.spotlight.flow.map((step) => (
                    <div key={step.title}>
                      <span>{step.label}</span>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
    </>
  );

  return (
    <>
      <PageHero kicker={`Monarch ${entry.display}`} title={notes.title} lede={notes.summary}>
        <div className={styles.facts}>
          {entry.publishedAt && (
            <p>
              <span>{copy.published}</span>
              {formatDate(entry.publishedAt, intl)}
            </p>
          )}
          <p>
            <span>{copy.audience}</span>
            {notes.audience}
          </p>
          {entry.asset && entry.state !== "revoked" && (
            <a className="btn btn-primary" href={entry.asset.url} download>
              {dl.download} {entry.display} · {formatBytes(entry.asset.size, intl)}
            </a>
          )}
          {entry.state === "revoked" && (
            <Link className="btn btn-glass" href={`${localePath(lang, "download")}#archive`}>
              {dl.stateRevoked} — {dl.archiveTitle}
            </Link>
          )}
        </div>
      </PageHero>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.grid}`}>
          <div className={styles.main}>
            {entry.patches.length > 1 ? (
              <VersionTabs
                label={`Monarch ${entry.display}`}
                tabs={[
                  { id: "notes", label: copy.tabNotes, panel: <div className={styles.main}>{notesBody}</div> },
                  {
                    id: "patches",
                    label: copy.tabPatches,
                    panel: (
                      <div className={styles.main}>
                        <p className={styles.patchesLede}>{copy.patchesLede}</p>
                        <ArchiveList
                          rows={patchRows}
                          copy={dl}
                          intl={intl}
                          updatesHref={localePath(lang, "updates")}
                          copyLabels={{ copy: dict.download.copy, copied: dict.download.copied }}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              notesBody
            )}
          </div>

          <aside className={styles.aside}>
            <div className={styles.asideCard} data-reveal>
              <p className="kicker">{copy.howItWorks}</p>
              <p>{notes.howItWorks}</p>
            </div>
            <div className={styles.tags} data-reveal>
              {notes.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <Link className="btn btn-glass" href={localePath(lang, "updates")}>
              ← {copy.allVersions}
            </Link>
          </aside>
        </div>
      </Reveal>
    </>
  );
}
