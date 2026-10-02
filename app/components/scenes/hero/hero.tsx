"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Dict } from "@/content/dictionary";
import { localePath, type Locale } from "@/lib/i18n";
import { OscarWindow } from "./oscar-window";
import { PixelGlyph, PixelText, burstFrom } from "@/components/pixel/pixel";
import { MonarchTile } from "@/components/brand/monarch-mark";
import { Pencil } from "@/components/motion/marked";
import type { GlyphName } from "@/components/pixel/engine";
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
        {/* The app icon and the version, in the film's lettering: pixels fall in with weight. */}
        <div className={styles.lockup}>
          <MonarchTile size={88} title="Monarch" className={styles.tile} />
          {release && <PixelText text={release.display} cell={11} label={`Monarch ${release.display}`} className={styles.version} />}
        </div>
        {release ? (
          <Link href={localePath(locale, `updates/${release.display}`)} className={styles.badge}>
            {hero.kicker}
            <span className={styles.badgeLink}>
              {hero.badge} <PixelGlyph name="arrow-right" size={10} />
            </span>
          </Link>
        ) : (
          <p className={styles.badge}>{hero.kicker}</p>
        )}
        <h1 id="hero-title" className={`display ${styles.title}`}>
          {hero.title.map((line, index) => (
            <span key={index} className={styles.line} style={{ "--line": index } as React.CSSProperties}>
              {line.map((part, partIndex) =>
                "accent" in part && part.accent && index === hero.title.length - 1 ? (
                  <span key={partIndex} className="mark" style={{ "--mark-delay": "760ms" } as React.CSSProperties}>
                    {part.t}
                    <Pencil seed={part.t} />
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
              onClick={(event) => {
                burstFrom(event);
                setAfterOpen(true);
              }}
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
              <PixelGlyph name="arrow-right" size={12} />
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
                <p className={styles.afterTitle}>
                  {afterOpen && <PixelGlyph name="check" size={21} animate />}
                  {hero.after.title}
                </p>
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
                  {hero.after.verify} <PixelGlyph name="arrow-right" size={10} />
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
              <span className={styles.factIndex}>
                <PixelGlyph name={FACT_GLYPHS[index] ?? "dot"} size={21} />
              </span>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* Local, consent, verified — a glyph for each, from the 7 × 7 set. */
const FACT_GLYPHS: GlyphName[] = ["home", "lock", "check"];

export function DownloadGlyph() {
  return <PixelGlyph name="arrow-down" size={14} />;
}
