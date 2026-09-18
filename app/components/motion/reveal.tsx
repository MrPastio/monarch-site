"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { spring, travel } from "./springs";
import type { SpringName } from "./springs";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: travel.mid },
  down: { x: 0, y: -travel.mid },
  left: { x: travel.far, y: 0 },
  right: { x: -travel.far, y: 0 },
  none: { x: 0, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  /** Where the element comes FROM — must match where it belongs. */
  from?: Direction;
  weight?: SpringName;
  /** Small stagger for siblings. Never used to gate an interaction. */
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
};

/**
 * Arrival on first scroll into view. Opacity + transform only.
 * Under reduced motion the element is simply present — no fade, no move.
 */
export function Reveal({
  children,
  from = "up",
  weight = "panel",
  index = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const offset = offsets[from];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ ...spring[weight], delay: Math.min(index, 5) * 0.06 }}
    >
      {children}
    </Tag>
  );
}
