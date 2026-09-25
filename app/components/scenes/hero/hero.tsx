"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { localePath, type Locale } from "@/lib/i18n";
import { OscarWindow } from "./oscar-window";
import styles from "./hero.module.css";

export function Hero({ locale, hero, journey, ui }: { locale: Locale; hero: Dict["hero"]; journey: Dict["journey"]; ui: Dict["ui"] }) {
  // The highlighter marks the words once the lines have arrived.
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setLit(true), 420);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`shell ${styles.copy}`} data-unlit={lit ? undefined : ""}>
        <p className={styles.kicker}>
          <span className={styles.badge}>{hero.kicker}</span>
        </p>
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
          <Link href={localePath(locale, "download")} className="btn btn-primary btn-lg">
            <DownloadGlyph />
            {hero.primary}
          </Link>
          <Link href={localePath(locale, "how-it-works")} className="btn btn-glass btn-lg">
            {hero.secondary}
            <span className="arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
        <p className={styles.note}>{hero.note}</p>
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
