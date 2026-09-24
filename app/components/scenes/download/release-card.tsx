import type { Dict } from "@/content/dictionary";
import type { CatalogEntry } from "@/lib/releases";
import { formatBytes, formatDate } from "@/lib/format";
import { localeMeta, type Locale } from "@/lib/i18n";
import { CopyButton } from "@/components/ui/copy-button";
import { MonarchMark } from "@/components/brand/monarch-mark";
import styles from "./release-card.module.css";

/** The verified current release: file, size, date, SHA-256 and channel signature. */
export function ReleaseCard({
  entry,
  signed,
  copy,
  locale,
}: {
  entry: CatalogEntry;
  signed: string | null;
  copy: Dict["download"];
  locale: Locale;
}) {
  const intl = localeMeta[locale].intl;
  const asset = entry.asset!;
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <MonarchMark size={40} />
        <div>
          <p className={styles.name}>Monarch</p>
          <p className={styles.version}>{entry.display}</p>
        </div>
        <span className={styles.channel}>stable</span>
      </header>

      <a className={`btn btn-primary btn-lg ${styles.cta}`} href={asset.url} download>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path d="M9 2.5v9m0 0 3.6-3.6M9 11.5 5.4 7.9M3 13.5v1.25c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V13.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {copy.primary}
        <span className={styles.ctaMeta}>{formatBytes(asset.size, intl)}</span>
      </a>

      <dl className={styles.meta}>
        <div>
          <dt>{copy.file}</dt>
          <dd className="mono">{asset.fileName}</dd>
        </div>
        <div>
          <dt>{copy.size}</dt>
          <dd>{formatBytes(asset.size, intl)}</dd>
        </div>
        {entry.publishedAt && (
          <div>
            <dt>{copy.date}</dt>
            <dd>{formatDate(entry.publishedAt, intl)}</dd>
          </div>
        )}
        <div>
          <dt>{copy.signature}</dt>
          <dd>{signed ?? "GitHub Release · SHA-256"}</dd>
        </div>
      </dl>

      <div className={styles.hash}>
        <div className={styles.hashHead}>
          <span>{copy.sha}</span>
          <CopyButton value={asset.sha256} label={copy.copy} done={copy.copied} />
        </div>
        <code className={styles.hashValue}>{asset.sha256}</code>
      </div>

      {entry.releaseUrl && (
        <a className={styles.github} href={entry.releaseUrl} target="_blank" rel="noreferrer">
          {copy.github} <span aria-hidden>↗</span>
        </a>
      )}
    </article>
  );
}
