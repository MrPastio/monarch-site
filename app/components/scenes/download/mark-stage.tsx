"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/components/motion/gsap";
import { MonarchMark } from "@/components/brand/monarch-mark";
import styles from "./mark-stage.module.css";

/**
 * The Monarch mark assembling, as the app's startup does: the two bands come
 * in from above along their own slopes and close into the sign, then a light
 * runs across the glass. It plays once when the stage comes into view; each
 * band is its own layer moved on the compositor. Reduced motion: at rest.
 */
export function MarkStage({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const line = stage.querySelector<HTMLElement>("[data-band='line']");
    const glass = stage.querySelector<HTMLElement>("[data-band='glass']");
    const sheen = stage.querySelector<HTMLElement>("[data-band='sheen']");
    if (!line || !glass || !sheen || typeof line.animate !== "function" || prefersReducedMotion()) {
      stage.dataset.state = "rest";
      return;
    }
    const animations: Animation[] = [];
    const play = () => {
      stage.dataset.state = "playing";
      const width = stage.querySelector<HTMLElement>("[data-mark-box]")?.getBoundingClientRect().width || 300;
      const unit = width / 49;
      const length = Math.hypot(17, 26);
      const move = (x: number, distance: number) =>
        `translate3d(${(x * distance * unit).toFixed(1)}px, ${((26 / length) * distance * unit).toFixed(1)}px, 0)`;
      const band = (element: HTMLElement, x: number) => {
        animations.push(element.animate([
          { transform: move(x, -30), opacity: 0, easing: "cubic-bezier(.22, 1, .36, 1)" },
          { transform: move(x, -14), opacity: 1, offset: 0.28, easing: "cubic-bezier(.33, 1, .68, 1)" },
          { transform: move(x, 0), opacity: 1 },
        ], { duration: 650, fill: "both" }));
      };
      band(line, 17 / length);
      band(glass, -17 / length);
      animations.push(sheen.animate([
        { transform: `translateX(${(0.3 * width).toFixed(1)}px) rotate(33.18deg)`, opacity: 0 },
        { transform: `translateX(${(0.46 * width).toFixed(1)}px) rotate(33.18deg)`, opacity: 1, offset: 0.3 },
        { transform: `translateX(${(0.86 * width).toFixed(1)}px) rotate(33.18deg)`, opacity: 1, offset: 0.8 },
        { transform: `translateX(${(1.02 * width).toFixed(1)}px) rotate(33.18deg)`, opacity: 0 },
      ], { duration: 520, delay: 880, easing: "cubic-bezier(.45, 0, .55, 1)", fill: "both" }));
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      play();
    }, { rootMargin: "0px 0px -20% 0px" });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <div ref={ref} className={styles.stage} data-state="waiting" role="img" aria-label={label}>
      <div className={styles.box} data-mark-box>
        <div className={styles.band} data-band="line"><MonarchMark size={490} className={styles.line} /></div>
        <div className={styles.band} data-band="glass">
          <MonarchMark size={490} className={styles.glass} />
          <span className={styles.sheenClip} aria-hidden><span className={styles.sheen} data-band="sheen" /></span>
        </div>
      </div>
    </div>
  );
}
