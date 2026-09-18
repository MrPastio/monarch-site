"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { spring, travel } from "../motion/springs";
import { useMediaQuery } from "../motion/use-media-query";
import { PipelineFigure } from "../pipeline-figure";
import type { HomeCopy } from "../../content/types";

/**
 * The one pinned section on the site.
 *
 * Scroll progress owns which step is active — no timers, no queue, so
 * scrolling back is always safe. Under reduced motion the pin is dropped
 * entirely and the steps become an ordinary vertical list.
 */
export function Story({ copy }: { copy: HomeCopy }) {
  const reduced = useReducedMotion();
  // A pinned section needs vertical room it does not have on a phone, and a
  // scroll-driven figure next to a single visible paragraph reads as broken.
  const narrow = useMediaQuery("(max-width: 900px)");
  const ref = useRef<HTMLDivElement>(null);
  const steps = copy.story.steps;
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(
      steps.length - 1,
      Math.max(0, Math.floor(progress * steps.length)),
    );
    setIndex(next);
  });

  const active = steps[index] ?? steps[0];

  if (reduced || narrow) {
    return (
      <section className="section story-static" id="story">
        <div className="shell">
          <p className="eyebrow">{copy.story.eyebrow}</p>
          <h2 className="headline">{copy.story.title}</h2>
          <p className="lede story-lede">{copy.story.lede}</p>
          <ol className="story-list">
            {steps.map((step) => (
              <li key={step.id} className="story-list-item card">
                <span className="mono story-list-ordinal">{step.ordinal}</span>
                <div>
                  <h3 className="subhead">{step.title}</h3>
                  <p className="body-muted">{step.detail}</p>
                  <p className="story-source mono">{step.source}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      id="story"
      className="story"
      ref={ref}
      /* One viewport of runway per step; the inner panel sticks inside it. */
      style={{ height: `${steps.length * 90}vh` }}
    >
      <div className="story-sticky">
        <div className="shell shell-wide story-grid">
          <div className="story-text">
            <p className="eyebrow">{copy.story.eyebrow}</p>
            <h2 className="headline story-title">{copy.story.title}</h2>
            <p className="lede story-lede">{copy.story.lede}</p>

            <div className="story-detail">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active?.id}
                  initial={{ opacity: 0, y: travel.near }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -travel.near }}
                  transition={spring.panel}
                >
                  <h3 className="subhead story-detail-title">{active?.title}</h3>
                  <p className="body-muted story-detail-text">{active?.detail}</p>
                  <p className="story-source mono">{active?.source}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="story-figure">
            <PipelineFigure
              steps={steps}
              activeId={active?.id ?? steps[0]!.id}
              boundaryLabels={copy.boundaryLabels}
              caption="Схема прохождения запроса"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
