"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Dict } from "@/content/dictionary";
import { localePath, type Locale } from "@/lib/i18n";
import { OscarWindow } from "./oscar-window";
import styles from "./hero.module.css";

export type HeroRelease = { url: string; size: string; display: string } | null;

type Platform = "windows" | "phone" | "other" | "unknown";

function readPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return "phone";
  if (/Windows NT/i.test(ua)) return "windows";
  return "other";
}

const noopSubscribe = () => () => {};

export function Hero({
  locale,
  hero,
  journey,
  ui,
  release,
}: {
  locale: Locale;
  hero: Dict["hero"];
  journey: Dict["journey"];
  ui: Dict["ui"];
  release: HeroRelease;
}) {
  // The highlighter marks the words once the lines have arrived.
  const [lit, setLit] = useState(false);
  const [afterOpen, setAfterOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const platform = useSyncExternalStore(noopSubscribe, readPlatform, () => "unknown" as Platform);

  useEffect(() => {
    const id = window.setTimeout(() => setLit(true), 420);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!afterOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setAfterOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [afterOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`shell ${styles.copy}`} data-unlit={lit ? undefined : ""}>
        {release ? (
          <Link href={localePath(locale, `updates/${release.display}`)} className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden />
            {hero.kicker}
            <span className={styles.badgeLink}>
              {hero.badge} <span aria-hidden>→</span>
            </span>
          </Link>
        ) : (
          <p className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden />
            {hero.kicker}
          </p>
        )}
        <h1 id="hero-title" className={`display ${styles.title}`}>
          {hero.title.map((line, index) => (
            <span key={index} className={styles.line} style={{ "--line": index } as React.CSSProperties}>
              {line.map((part, partIndex) =>
                "accent" in part && part.accent ? (
                  <span key={partIndex} className="mark" style={{ "--mark-delay": `${260 + index * 220}ms` } as React.CSSProperties}>
                    {part.t}
                  </span>
                ) : (
                  <span key={partIndex}>{part.t}</span>
                ),
              )}
            </span>
          ))}
        </h1>
        <p className={`lede ${styles.lede}`}>{hero.lede}</p>
        <div className={styles.ctas}>
          {release ? (
            <a
              href={release.url}
              className="btn btn-primary btn-lg"
              onClick={() => setAfterOpen(true)}
              aria-expanded={afterOpen}
              aria-controls="after-download"
            >
              <DownloadGlyph />
              {hero.primary}
              <span className={styles.ctaMeta}>{release.size}</span>
            </a>
          ) : (
            <Link href={localePath(locale, "download")} className="btn btn-primary btn-lg">
              <DownloadGlyph />
              {hero.primary}
            </Link>
          )}
          <Link href={localePath(locale, "how-it-works")} className="btn btn-glass btn-lg">
            {hero.secondary}
            <span className="arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
        <p className={styles.note} data-platform={platform}>
          {platform === "phone" ? (
            <>
              {hero.platform.phone}{" "}
              <button type="button" className={styles.copyLink} onClick={copyLink}>
                {copied ? hero.platform.copied : hero.platform.copy}
              </button>
            </>
          ) : platform === "other" ? (
            hero.platform.other
          ) : (
            hero.note
          )}
        </p>

        <div id="after-download" className={styles.after} data-open={afterOpen} aria-live="polite" inert={!afterOpen}>
          <div className={styles.afterClip}>
            <div className={styles.afterCard}>
              <header className={styles.afterHead}>
                <p className={styles.afterTitle}>{hero.after.title}</p>
                <p className={styles.afterLede}>{hero.after.lede}</p>
              </header>
              <ol className={styles.afterSteps}>
                {hero.after.steps.map((step, index) => (
                  <li key={step.title} style={{ "--i": index } as React.CSSProperties}>
                    <span className={styles.afterNum}>{index + 1}</span>
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
              <div className={styles.afterActions}>
                <Link href={`${localePath(locale, "download")}#verify`} className={styles.afterLink}>
                  {hero.after.verify} <span aria-hidden>→</span>
                </Link>
                <button type="button" className="btn btn-glass" onClick={() => setAfterOpen(false)}>
                  {hero.after.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`shell-wide ${styles.stage}`}>
        <OscarWindow journey={journey} ui={ui} copy={hero.window} />
      </div>

      <div className="shell">
        <dl className={styles.facts}>
          {hero.facts.map((fact, index) => (
            <div key={fact.value} className={styles.fact}>
              <span className={styles.factIndex}>{String(index + 1).padStart(2, "0")}</span>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function DownloadGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M9 2.5v9m0 0 3.6-3.6M9 11.5 5.4 7.9M3 13.5v1.25c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V13.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
