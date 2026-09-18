"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "../motion/springs";
import { Reveal } from "../motion/reveal";
import { displayVersion, formatBytes, formatDate } from "../../lib/format";
import type { NormalizedReleaseState } from "../../lib/release-display";
import type { HomeCopy } from "../../content/types";

function CopyHash({ value, copy }: { value: string; copy: HomeCopy }) {
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="hash-field">
      <code className="mono hash-value">{value}</code>
      <button
        type="button"
        className="btn btn-secondary hash-copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
          } catch {
            /* clipboard can be blocked; the value stays selectable */
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "done" : "idle"}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={reduced ? { duration: 0 } : spring.control}
          >
            {copied ? copy.download.copied : copy.download.copy}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

export function Download({
  copy,
  release,
}: {
  copy: HomeCopy;
  release: NormalizedReleaseState;
}) {
  const ready = release.status === "ready" ? release.release : null;
  const verified = ready?.sourceStatus === "verified";
  const invalid = release.status === "unavailable" && release.sourceStatus === "invalid";

  return (
    <section className="section download" id="download">
      <div className="shell shell-wide download-grid">
        <Reveal from="up" className="download-intro">
          <p className="eyebrow">{copy.download.eyebrow}</p>
          <h2 className="headline section-title">{copy.download.title}</h2>
          <p className="lede">{copy.download.lede}</p>

          <ol className="download-steps">
            {copy.download.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Reveal>

        <Reveal from="up" index={1} className="release-card card" weight="panel">
          {ready ? (
            <>
              <header className="release-head">
                <span
                  className="release-status"
                  data-state={verified ? "verified" : "confirmed"}
                >
                  {verified ? copy.download.verified : "Подтверждено по GitHub Release"}
                </span>
                <span className="release-channel mono">{ready.channel}</span>
              </header>

              <p className="release-version">
                <span className="release-version-name">Monarch</span>
                <span className="release-version-number">
                  {displayVersion(ready.version)}
                </span>
              </p>
              <p className="release-date body-muted">
                {copy.download.fields.published}: {formatDate(ready.publishedAt)}
              </p>

              <dl className="release-facts">
                <div>
                  <dt>{copy.download.fields.file}</dt>
                  <dd className="mono">{ready.fileName}</dd>
                </div>
                <div>
                  <dt>{copy.download.fields.size}</dt>
                  <dd>{formatBytes(ready.sizeBytes)}</dd>
                </div>
                <div>
                  <dt>{copy.download.fields.signature}</dt>
                  <dd>{ready.signature}</dd>
                </div>
                <div>
                  <dt>{copy.download.fields.channel}</dt>
                  <dd className="mono">{ready.channel}</dd>
                </div>
              </dl>

              <div className="release-hash">
                <p className="eyebrow">{copy.download.fields.hash}</p>
                <CopyHash value={ready.sha256} copy={copy} />
              </div>

              <div className="release-actions">
                <a
                  className="btn btn-primary btn-lg"
                  href={ready.downloadUrl}
                  rel="noreferrer noopener"
                >
                  {copy.download.cta}
                </a>
                <a
                  className="btn btn-secondary"
                  href={ready.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {copy.download.ctaSecondary} ↗
                </a>
              </div>
            </>
          ) : (
            <div className="release-blocked">
              <span className="release-status" data-state={invalid ? "invalid" : "unavailable"}>
                {invalid ? copy.download.invalid : copy.download.unavailable}
              </span>
              <p className="body-muted release-blocked-text">
                {invalid
                  ? "Подпись манифеста не совпала с ожидаемым ключом, поэтому прямая загрузка отключена. Скачивай только со страницы релизов на GitHub."
                  : "Канал обновлений сейчас недоступен. Актуальный файл всегда есть на странице релизов."}
              </p>
              <a
                className="btn btn-secondary"
                href="https://github.com/MrPastio/monarch-releases/releases"
                target="_blank"
                rel="noreferrer noopener"
              >
                {copy.download.ctaSecondary} ↗
              </a>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
