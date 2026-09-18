"use client";

import { motion, useReducedMotion } from "motion/react";
import { spring, travel } from "../motion/springs";
import { PipelineFigure } from "../pipeline-figure";
import type { HomeCopy } from "../../content/types";
import type { NormalizedReleaseState } from "../../lib/release-display";
import { formatBytes } from "../../lib/format";

export function Hero({
  copy,
  release,
}: {
  copy: HomeCopy;
  release: NormalizedReleaseState;
}) {
  const reduced = useReducedMotion();
  const ready = release.status === "ready" ? release.release : null;

  // Hero arrives once, from below, as one weighted group.
  const rise = (index: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: travel.mid },
          animate: { opacity: 1, y: 0 },
          transition: { ...spring.hero, delay: index * 0.07 },
        };

  return (
    <section className="hero" id="top">
      <div className="shell shell-wide hero-inner">
        <div className="hero-copy">
          <motion.p className="hero-pill" {...rise(0)}>
            {copy.hero.pill}
          </motion.p>

          <motion.h1 className="display hero-title" {...rise(1)}>
            {copy.hero.titleLead}{" "}
            <span className="accent-text">{copy.hero.titleAccent}</span>
            <br />
            {copy.hero.titleTail}
          </motion.h1>

          <motion.p className="lede hero-lede" {...rise(2)}>
            {copy.hero.lede}
          </motion.p>

          <motion.div className="hero-actions" {...rise(3)}>
            <a className="btn btn-primary btn-lg" href="#download">
              {copy.hero.ctaPrimary}
            </a>
            <a className="btn btn-secondary btn-lg" href="#story">
              {copy.hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.p className="hero-trust" {...rise(4)}>
            <span>{copy.hero.trustPrefix}</span>
            {ready ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatBytes(ready.sizeBytes)}</span>
                <span aria-hidden="true">·</span>
                <span>Манифест подписан Ed25519</span>
                <span aria-hidden="true">·</span>
                <a href="#download" className="hero-trust-link">
                  SHA-256 ниже
                </a>
              </>
            ) : null}
          </motion.p>
        </div>

        <motion.div
          className="hero-figure"
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, y: travel.far },
                animate: { opacity: 1, y: 0 },
                transition: { ...spring.hero, delay: 0.18 },
              })}
        >
          <PipelineFigure
            steps={copy.story.steps}
            activeId="permission"
            boundaryLabels={copy.boundaryLabels}
            caption="Схема прохождения запроса"
            compact
          />
          <p className="hero-figure-note">
            Схема, а не снимок экрана. Разрешение — отдельный шаг:{" "}
            <code className="mono">src/core/permission-gate.ts</code>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
