"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import styles from "./night-band.module.css";

/**
 * The Ink chapter: the same sheet turned over — black paper, white ink.
 * As it scrolls in, the black sheet opens as a circle from its top-left
 * corner, the way the app turns Paper into Ink. Scroll owns the motion
 * (scrub), so it is never queued and runs backwards when you scroll back.
 * Reduced motion and no-JS show the sheet whole.
 */
export function NightBand({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = ref.current;
    if (!band || prefersReducedMotion()) return;
    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.fromTo(
        band,
        { clipPath: "circle(6% at 0% 0%)" },
        {
          clipPath: "circle(142% at 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: band, start: "top 92%", end: "top 18%", scrub: 0.6 },
        },
      );
    }, band);
    return () => context.revert();
  }, []);

  return (
    <div ref={ref} className={`night ${styles.band}`} id={id}>
      {children}
    </div>
  );
}
