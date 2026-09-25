import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localeMeta, localePath } from "@/lib/i18n";
import { getReleaseCatalog } from "@/lib/releases";
import { PageHero } from "@/components/page/page-hero";
import { ArchiveList } from "@/components/page/archive-list";
import { ReleaseCard } from "@/components/scenes/download/release-card";
import { CopyButton } from "@/components/ui/copy-button";
import styles from "./download.module.css";

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.pages.download.title,
    description: dict.pages.download.lede,
    alternates: { canonical: `/${lang}/download` },
  };
}

export default async function DownloadPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.download;
  const catalog = await getReleaseCatalog();
  const intl = localeMeta[lang].intl;
  const signed =
    catalog.stable.status === "ready" && catalog.stable.verification === "signed-manifest"
      ? `Ed25519 · ${catalog.stable.manifest.keyId}`
      : null;
  const command = catalog.current?.asset
    ? `Get-FileHash .\\${catalog.current.asset.fileName} -Algorithm SHA256`
    : copy.command;

  const rows = catalog.entries.map((entry) => ({
    version: entry.version,
    display: entry.display,
    publishedAt: entry.publishedAt,
    releaseUrl: entry.releaseUrl,
    asset: entry.asset,
    state: entry.state,
    title: entry.notes?.title ?? null,
    reason: entry.notes && entry.notes.status === "withdrawn" ? entry.notes.withdrawal.reason : null,
  }));

  return (
    <>
      <PageHero kicker={dict.download.kicker} title={copy.title} lede={copy.lede} home={localePath(lang)}>
        {catalog.current?.asset && <ReleaseCard entry={catalog.current} signed={signed} copy={dict.download} locale={lang} />}
      </PageHero>

      <section className={styles.section} id="verify">
        <div className="shell">
          <h2 className={styles.h2}>{copy.verifyTitle}</h2>
          <ol className={styles.steps}>
            {copy.verifySteps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepIndex}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {index === 1 && (
                  <div className={styles.command}>
                    <code>{command}</code>
                    <CopyButton value={command} label={dict.download.copy} done={dict.download.copied} />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className={styles.reqs}>
            {dict.download.requirements.map((item) => (
              <p key={item.label}>
                <span>{item.label}</span>
                {item.value}
              </p>
            ))}
          </div>
          <p className={styles.note}>{dict.download.smartscreen}</p>
        </div>
      </section>

      <section className={styles.section} id="archive">
        <div className="shell">
          <h2 className={styles.h2}>{copy.archiveTitle}</h2>
          <p className={styles.sub}>{copy.archiveLede}</p>
          {catalog.source === "snapshot" && <p className={styles.note}>{copy.sourceSnapshot}</p>}
          <ArchiveList
            rows={rows}
            copy={copy}
            intl={intl}
            updatesHref={localePath(lang, "updates")}
            copyLabels={{ copy: dict.download.copy, copied: dict.download.copied }}
          />
        </div>
      </section>
    </>
  );
}
