"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import { localePath, type Locale } from "@/lib/i18n";
import type { CrestHandle } from "./crest-renderer";
import styles from "./hero.module.css";

type Mode = "loading" | "live" | "poster";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero({ locale, hero }: { locale: Locale; hero: Dict["hero"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const crestRef = useRef<CrestHandle | null>(null);
  const [mode, setMode] = useState<Mode>("loading");

  // Mount the live crest after first paint; fall back to the poster.
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    let cancelled = false;
    const reduced = prefersReducedMotion();

    const wide = () => window.matchMedia("(min-width: 900px)").matches;
    const load = async () => {
      if (!supportsWebGL()) {
        setMode("poster");
        return;
      }
      try {
        const { mountCrest } = await import("./crest-renderer");
        if (cancelled) return;
        const handle = await mountCrest({
          container,
          reducedMotion: reduced,
          anchorX: () => (wide() ? 0.2 : 0),
          fill: () => (wide() ? 0.6 : 0.78),
          onReady: () => !cancelled && setMode("live"),
        });
        if (cancelled) {
          handle.dispose();
          return;
        }
        crestRef.current = handle;
      } catch {
        if (!cancelled) setMode("poster");
      }
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    idle(() => void load());

    return () => {
      cancelled = true;
      crestRef.current?.dispose();
      crestRef.current = null;
    };
  }, []);

  // Scroll: the copy leaves upward, the crest turns to face you and the
  // camera dives into its core — the way into the machine.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const media = gsap.matchMedia();

    media.add("(min-width: 900px)", () => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => crestRef.current?.setProgress(self.progress),
        },
      });
      timeline
        .to(copyRef.current, { yPercent: -18, autoAlpha: 0, duration: 0.32 }, 0)
        .to(cueRef.current, { autoAlpha: 0, duration: 0.08 }, 0)
        .fromTo(veilRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 }, 0.82);
      return () => {
        crestRef.current?.setProgress(0);
      };
    });

    return () => {
      media.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.stage}>
        <div
          ref={canvasRef}
          className={styles.canvas}
          data-mode={mode}
          role="img"
          aria-label={hero.crestLabel}
        >
          {mode === "poster" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.poster} src="/brand/logo-dark.webp" alt="" width={960} height={960} />
          )}
        </div>

        <div ref={copyRef} className={`shell-wide ${styles.copy}`}>
          <p className="kicker">{hero.kicker}</p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            {hero.title.map((line, index) => (
              <span key={index} className={styles.line} style={{ "--line": index } as React.CSSProperties}>
                <span className={styles.lineInner}>
                {line.map((part, partIndex) =>
                  "accent" in part && part.accent ? (
                    <span key={partIndex} className="gold">
                      {part.t}
                    </span>
                  ) : (
                    <span key={partIndex}>{part.t}</span>
                  ),
                )}
              </span>
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
          <dl className={styles.facts}>
            {hero.facts.map((fact) => (
              <div key={fact.value} className={styles.fact}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={cueRef} className={styles.cue} aria-hidden>
          <span>{hero.scrollCue}</span>
          <i />
        </div>
        <div ref={veilRef} className={styles.veil} aria-hidden />
      </div>
    </section>
  );
}

function DownloadGlyph() {
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
