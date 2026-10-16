"use client";

import { useId } from "react";
import { asset } from "@/lib/asset";
import styles from "./monarch-mark.module.css";

/**
 * The Monarch mark (owner, 2026-10-16): two equal bands mirrored about the
 * axis on a grid u = 1/26 of the height — W 49u, H 26u, slope 17u : 26u,
 * shared base 15u. The left band is an inner contour; the right one is glass
 * laid on top, so the contour never shows through it. The same geometry draws
 * the app's icons (Monarch src/ui/public/modules/brand-mark.js).
 */
export const MARK_LEFT_BAND = "M0 0H15L32 26H17Z";
export const MARK_RIGHT_BAND = "M34 0H49L32 26H17Z";
export const MARK_ASPECT = 26 / 49;

/**
 * `auto` follows the ground it sits on (paper, or a `.night` sheet); `dark`
 * and `light` pin the variant for a fixed ground such as the app icon tile.
 */
export function MonarchMark({
  size = 32,
  variant = "auto",
  title,
  className,
}: {
  size?: number;
  variant?: "auto" | "dark" | "light";
  title?: string;
  className?: string;
}) {
  const id = `mm${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      className={[styles.mark, className].filter(Boolean).join(" ")}
      data-variant={variant}
      width={size}
      height={Math.round(size * MARK_ASPECT)}
      viewBox="0 0 49 26"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <clipPath id={`${id}l`}><path d={MARK_LEFT_BAND} /></clipPath>
        <clipPath id={`${id}r`}><path d={MARK_RIGHT_BAND} /></clipPath>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--mark-glass-a)" }} />
          <stop offset="1" style={{ stopColor: "var(--mark-glass-b)" }} />
        </linearGradient>
      </defs>
      <path d={MARK_LEFT_BAND} clipPath={`url(#${id}l)`} className={styles.contour} vectorEffect="non-scaling-stroke" />
      <path d={MARK_RIGHT_BAND} style={{ fill: `url(#${id}g)` }} />
      <path d={MARK_RIGHT_BAND} clipPath={`url(#${id}r)`} className={styles.edge} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** The app icon: the mark on its ink tile, as on the Windows taskbar. */
export function MonarchTile({ size = 32, title, className }: { size?: number; title?: string; className?: string }) {
  return (
    <span
      className={[styles.tile, className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.22) }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <MonarchMark size={Math.round(size * (size <= 24 ? 0.86 : 0.74))} variant="dark" />
    </span>
  );
}

/** The MONARCH wordmark, cut 1:1 from the official artwork and tinted by CSS. */
export function MonarchWordmark({ height = 14, className }: { height?: number; className?: string }) {
  return (
    <span
      className={[styles.wordmark, className].filter(Boolean).join(" ")}
      style={{ height, width: Math.round((height * 937) / 104), "--wordmark": `url("${asset("/brand/wordmark.webp")}")` } as React.CSSProperties}
      aria-hidden
    />
  );
}
