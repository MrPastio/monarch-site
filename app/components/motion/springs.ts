/**
 * Motion contract for the Monarch site.
 *
 * Owner rule (AGENTS.md): elements have weight, direction and continuity —
 * they arrive, leave, move, expand and collapse from a place that makes
 * sense. Not blinking, not permanent glow. One owner per animation,
 * interruptible transitions with no queueing, reduced motion always honoured.
 *
 * Three weight classes. Nothing on this site animates outside them.
 */
export const spring = {
  /** Small controls reacting to a direct input. Light, snappy. */
  control: { type: "spring", stiffness: 420, damping: 34, mass: 0.7 },
  /** Panels and cards that open, move or reflow. Medium weight. */
  panel: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  /** Large surfaces: hero, the scroll story frames. Heavy, settles slowly. */
  hero: { type: "spring", stiffness: 150, damping: 24, mass: 1.1 },
} as const;

/** Distance an element travels when it arrives. Direction is per-use. */
export const travel = {
  near: 12,
  mid: 24,
  far: 44,
} as const;

export type SpringName = keyof typeof spring;
