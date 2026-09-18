"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { spring } from "./motion/springs";
import type { HomeCopy } from "../content/types";

/**
 * On narrow screens the header has no room for the download button, so it
 * comes back as a bar once the hero's own button has scrolled away — it
 * arrives from the bottom edge, which is where it lives.
 */
export function MobileActionBar({ copy }: { copy: HomeCopy }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const observed = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const heroCta = document.querySelector<HTMLElement>(".hero-actions");
    const downloadSection = document.querySelector<HTMLElement>("#download");
    if (!heroCta) return;
    observed.current = heroCta;

    let heroVisible = true;
    let downloadVisible = false;
    const sync = () => setVisible(!heroVisible && !downloadVisible);

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0 },
    );
    heroObserver.observe(heroCta);

    // Hiding it over the download card avoids covering the real button.
    const downloadObserver = downloadSection
      ? new IntersectionObserver(
          ([entry]) => {
            downloadVisible = entry?.isIntersecting ?? false;
            sync();
          },
          { threshold: 0 },
        )
      : null;
    if (downloadSection && downloadObserver) downloadObserver.observe(downloadSection);

    return () => {
      heroObserver.disconnect();
      downloadObserver?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="mobile-action-bar"
          initial={reduced ? { opacity: 0 } : { y: "100%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "100%" }}
          transition={reduced ? { duration: 0 } : spring.panel}
        >
          <a className="btn btn-primary mobile-action-cta" href="#download">
            {copy.hero.ctaPrimary}
          </a>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
