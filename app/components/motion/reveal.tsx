"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "./gsap";

/**
 * Arrivals for a whole section: every `[data-reveal]` inside rises into place
 * once, when it first enters the viewport — from below, the direction you are
 * scrolling from. Nothing re-animates on the way back up.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  id,
  labelledBy,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const context = gsap.context(() => {
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.07, overwrite: true },
          ),
      });
      // Hide only what has not been seen yet, so no-JS and reduced motion stay visible.
      targets.forEach((target) => {
        if (target.getBoundingClientRect().top > window.innerHeight * 0.88) gsap.set(target, { autoAlpha: 0 });
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className} id={id} aria-labelledby={labelledBy}>
      {children}
    </Tag>
  );
}
