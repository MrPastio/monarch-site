"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import type { CatalogEntry } from "@/lib/releases";
import { formatBytes, formatDate } from "@/lib/format";
import { CopyButton } from "@/components/ui/copy-button";
import styles from "./archive-list.module.css";

type Row = Pick<CatalogEntry, "version" | "display" | "publishedAt" | "releaseUrl" | "asset" | "state"> & {
  title: string | null;
  reason: string | null;
};

export function ArchiveList({
  rows,
  copy,
  intl,
  updatesHref,
  copyLabels,
}: {
  rows: Row[];
  copy: Dict["pages"]["download"];
  intl: string;
  updatesHref: string;
  copyLabels: { copy: string; copied: string };
}) {
  return (
    <ol className={styles.list}>
      {rows.map((row) => (
        <ArchiveRow key={row.version} row={row} copy={copy} intl={intl} updatesHref={updatesHref} copyLabels={copyLabels} />
      ))}
    </ol>
  );
}

function ArchiveRow({
  row,
  copy,
  intl,
  updatesHref,
  copyLabels,
}: {
  row: Row;
  copy: Dict["pages"]["download"];
  intl: string;
  updatesHref: string;
  copyLabels: { copy: string; copied: string };
}) {
  const [ack, setAck] = useState(false);
  const stateLabel = {
    current: copy.stateCurrent,
    archive: copy.stateArchive,
    revoked: copy.stateRevoked,
    history: copy.stateHistory,
  }[row.state];
  const canDownload = row.asset && (row.state !== "revoked" || ack);

  return (
    <li className={styles.row} data-state={row.state}>
      <div className={styles.head}>
        <span className={styles.version}>{row.display}</span>
        <span className={styles.badge}>{stateLabel}</span>
        {row.publishedAt && <time className={styles.date}>{formatDate(row.publishedAt, intl)}</time>}
      </div>
      <div className={styles.body}>
        {row.title && <p className={styles.title}>{row.title}</p>}
        {row.state === "archive" && <p className={styles.note}>{copy.oldWarning}</p>}
        {row.state === "history" && <p className={styles.note}>{copy.historyNote}</p>}
        {row.state === "revoked" && (
          <div className={styles.revoked}>
            <p>{copy.revokedWarning}</p>
            {row.reason && <p className={styles.reason}>{row.reason}</p>}
            {row.asset && (
              <label className={styles.ack}>
                <input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} />
                <span className={styles.box} aria-hidden />
                {copy.revokedAck}
              </label>
            )}
          </div>
        )}
        {row.asset && (
          <div className={styles.asset} data-open={Boolean(canDownload)}>
            <div className={styles.assetInner}>
              <code className={styles.sha}>{row.asset.sha256}</code>
              <div className={styles.actions}>
                <CopyButton value={row.asset.sha256} label={copyLabels.copy} done={copyLabels.copied} />
                <span className={styles.size}>{formatBytes(row.asset.size, intl)}</span>
                <a
                  className={`btn ${row.state === "revoked" ? "btn-glass" : "btn-glass"} ${styles.download}`}
                  href={canDownload ? row.asset.url : undefined}
                  aria-disabled={!canDownload}
                  tabIndex={canDownload ? 0 : -1}
                  download
                >
                  {copy.download} {row.display}
                </a>
              </div>
            </div>
          </div>
        )}
        {row.title && (
          <Link className={styles.more} href={`${updatesHref}/${row.display}`}>
            {copy.notes} →
          </Link>
        )}
      </div>
    </li>
  );
}
