"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring, travel } from "../motion/springs";
import { Reveal } from "../motion/reveal";
import type { Boundary, HomeCopy } from "../../content/types";

/**
 * The three access boundaries. Selecting one moves a single shared marker
 * (layoutId) — the panel is understood as the same object changing place,
 * not three panels blinking.
 */
export function Boundaries({ copy }: { copy: HomeCopy }) {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<Boundary>("device");
  const active = copy.boundaries.items.find((item) => item.id === selected)!;

  return (
    <section className="section" id="boundaries">
      <div className="shell shell-wide">
        <Reveal from="up">
          <p className="eyebrow">{copy.boundaries.eyebrow}</p>
          <h2 className="headline section-title">{copy.boundaries.title}</h2>
          <p className="lede">{copy.boundaries.lede}</p>
        </Reveal>

        <div className="boundary-layout">
          <div className="boundary-list" role="tablist" aria-label={copy.boundaries.eyebrow}>
            {copy.boundaries.items.map((item) => {
              const isActive = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`boundary-tab-${item.id}`}
                  aria-selected={isActive}
                  aria-controls="boundary-panel"
                  className="boundary-option"
                  data-active={isActive || undefined}
                  data-tone={item.id}
                  onClick={() => setSelected(item.id)}
                >
                  {isActive && !reduced ? (
                    <motion.span
                      layoutId="boundary-highlight"
                      className="boundary-highlight"
                      transition={spring.panel}
                    />
                  ) : null}
                  <span className="boundary-option-body">
                    <span className="boundary-option-title">{item.title}</span>
                    <span className="boundary-option-stance">{item.stance}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="boundary-panel card"
            id="boundary-panel"
            role="tabpanel"
            aria-labelledby={`boundary-tab-${selected}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, x: travel.near }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, x: -travel.near }}
                transition={reduced ? { duration: 0 } : spring.panel}
              >
                <p className="eyebrow">{active.stance}</p>
                <h3 className="subhead boundary-panel-title">{active.title}</h3>
                <p className="body-muted">{active.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
