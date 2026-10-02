"use client";

import { useEffect, useRef } from "react";
import {
  GLYPHS,
  PHYSICS,
  burst,
  drawPixels,
  energy,
  glyphCells,
  hash,
  makePixel,
  prefersReduced,
  rng,
  setupCanvas,
  stepPixel,
  wake,
  type GlyphName,
  type Pixel,
} from "./engine";
import styles from "./pixel.module.css";

/* ------------------------------------------------------------- PixelGlyph */

/**
 * A 7 × 7 pixel glyph that inherits currentColor. `animate` pops its cells in
 * with the system stagger (18 ms) — once, when it mounts or when `play` flips.
 */
export function PixelGlyph({
  name,
  size = 14,
  animate = false,
  className,
  title,
}: {
  name: GlyphName;
  size?: number;
  animate?: boolean;
  className?: string;
  title?: string;
}) {
  const cells = glyphCells(GLYPHS[name]);
  return (
    <svg
      className={[styles.glyph, animate ? styles.glyphAnimate : "", className ?? ""].join(" ")}
      viewBox="0 0 7 7"
      width={size}
      height={size}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {cells.map(([c, r], index) => (
        <rect
          key={`${c}-${r}`}
          x={c + 0.07}
          y={r + 0.07}
          width={0.86}
          height={0.86}
          rx={0.24}
          style={animate ? ({ "--i": index } as React.CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------ PixelLoader */

const LOADER = {
  xs: { box: 16, n: 7, px: 2.6, r: 5 },
  s: { box: 20, n: 8, px: 3, r: 6.2 },
  m: { box: 36, n: 10, px: 4.5, r: 12 },
  l: { box: 64, n: 12, px: 7, r: 22 },
} as const;
const LOADER_CYCLE = 2.8;
const CHECK_CELLS: [number, number][] = [
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 4],
  [4, 3],
  [5, 2],
  [6, 1],
];

/**
 * The PaperPixel loader: a cloud of rotating pixels assembles into a ring,
 * chases round, scatters and gathers again. `done` collapses it into a tick.
 * Reduced motion: a still ring with one pixel stepping, then the tick.
 */
export function PixelLoader({ size = "s", done = false, label }: { size?: keyof typeof LOADER; done?: boolean; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(done);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    doneRef.current = done;
    kick.current();
  }, [done]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const cfg = LOADER[size];
    const B = cfg.box;
    const C = B / 2;
    const ctx = setupCanvas(canvas, B, B);
    if (!ctx) return;
    const rand = rng(B * 7919 + Math.floor(Math.random() * 1e6));
    const cloud = (p: Pixel) => {
      const m = cfg.px;
      p.tx = m + rand() * (B - 2 * m);
      p.ty = m + rand() * (B - 2 * m);
      p.ta = rand() * 90;
    };
    const pixels = Array.from({ length: cfg.n }, () => {
      const p = makePixel(0, 0, cfg.px);
      cloud(p);
      p.x = p.tx;
      p.y = p.ty;
      p.a = rand() * 90;
      return p;
    });
    const impulse = (PHYSICS.scatter * B) / 120;
    let t = rand() * LOADER_CYCLE;
    let phase = "";
    let ring = 0;
    let color = getComputedStyle(canvas).color;
    let colorAge = 0;
    let settled = 0;
    let stepIndex = 0;
    let stepClock = 0;
    const placeCheck = () =>
      pixels.forEach((p, i) => {
        const [cx, cy] = CHECK_CELLS[i % CHECK_CELLS.length]!;
        const g = (B * 0.78) / 7;
        p.tx = C + (cx - 3) * g;
        p.ty = C + (cy - 3) * g;
        p.ta = 0;
        p.k = PHYSICS.snap;
        p.c = PHYSICS.snapDamping;
      });
    let stop: (() => void) | null = null;
    const actor = {
      step(dt: number) {
        if (!canvas.isConnected) return false;
        colorAge += dt;
        if (colorAge > 0.5) {
          color = getComputedStyle(canvas).color;
          colorAge = 0;
        }
        if (prefersReduced()) {
          stepClock += dt;
          if (doneRef.current) {
            placeCheck();
            pixels.forEach((p) => Object.assign(p, { x: p.tx, y: p.ty, a: 0, o: 1 }));
            drawPixels(ctx, pixels, color, B, B);
            stop = null;
            return false;
          }
          if (stepClock >= 0.16 || phase !== "reduced") {
            stepClock = 0;
            stepIndex += 1;
            phase = "reduced";
            pixels.forEach((p, i) => {
              const angle = (i / pixels.length) * Math.PI * 2 - Math.PI / 2;
              p.x = C + Math.cos(angle) * cfg.r;
              p.y = C + Math.sin(angle) * cfg.r;
              p.a = (angle * 180) / Math.PI;
              p.o = i === stepIndex % pixels.length ? 1 : 0.3;
            });
            drawPixels(ctx, pixels, color, B, B);
          }
          return true;
        }
        t += dt;
        const u = (t % LOADER_CYCLE) / LOADER_CYCLE;
        const next = doneRef.current ? "done" : u < 0.62 ? "ring" : "scatter";
        if (next !== phase) {
          if (next === "scatter") {
            for (const p of pixels) {
              const dx = p.x - C;
              const dy = p.y - C;
              const d = Math.hypot(dx, dy) || 1;
              p.vx += (dx / d) * impulse * (0.6 + rand() * 0.8);
              p.vy += (dy / d) * impulse * (0.6 + rand() * 0.8);
              p.va += (rand() - 0.5) * 2 * PHYSICS.spin;
              p.k = 84;
              p.c = 9;
              cloud(p);
            }
          } else if (next === "ring") {
            for (const p of pixels) {
              p.k = PHYSICS.snap;
              p.c = PHYSICS.snapDamping;
              p.o = 1;
            }
          } else {
            placeCheck();
          }
          phase = next;
          settled = 0;
        }
        if (phase === "ring") {
          ring += dt * 300;
          const local = t % LOADER_CYCLE;
          pixels.forEach((p, i) => {
            if (local < i * 0.035) return;
            const deg = ring + (i * 360) / pixels.length;
            const angle = (deg * Math.PI) / 180;
            p.tx = C + Math.cos(angle) * cfg.r;
            p.ty = C + Math.sin(angle) * cfg.r;
            p.ta = deg;
          });
        } else if (phase === "scatter" && rand() < dt * 3) {
          cloud(pixels[Math.floor(rand() * pixels.length)]!);
        }
        for (const p of pixels) stepPixel(p, dt);
        drawPixels(ctx, pixels, color, B, B);
        if (phase === "done") {
          settled = energy(pixels) < 0.5 ? settled + dt : 0;
          if (settled > 0.3) {
            stop = null;
            return false;
          }
        }
        return true;
      },
    };
    const start = () => {
      if (!stop) stop = wake(actor);
    };
    kick.current = start;
    start();
    return () => {
      stop?.();
      stop = null;
      kick.current = () => {};
    };
  }, [size]);

  const box = LOADER[size].box;
  return (
    <span className={styles.loader} role="img" aria-label={label ?? (done ? "Готово" : "Загрузка")}>
      <canvas ref={ref} aria-hidden style={{ width: box, height: box }} />
    </span>
  );
}

/* ------------------------------------------------------------- PixelField */

/**
 * A picture made of pixels that live: they arrive from a scattered cloud and
 * settle into the pattern when first seen, the pointer pushes them aside, a
 * click scatters them and the springs bring them home. Reduced motion draws
 * the pattern still.
 */
export function PixelField({
  pattern,
  cell = 12,
  gap = 2,
  padding,
  label,
  className,
  assemble = true,
  from = "below",
}: {
  pattern: readonly string[];
  cell?: number;
  gap?: number;
  padding?: number;
  label: string;
  className?: string;
  assemble?: boolean;
  /** "above": pixels fall in with weight, column by column, left to right. */
  from?: "below" | "above";
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pitch = cell + gap;
  const cols = Math.max(...pattern.map((row) => row.length));
  const pad = padding ?? cell * 3;
  const W = cols * pitch - gap + pad * 2;
  const H = pattern.length * pitch - gap + pad * 2;
  const key = pattern.join("|");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, W, H);
    if (!ctx) return;
    let color = getComputedStyle(canvas).color;
    const rand = rng(hash(key));
    const pixels: Pixel[] = [];
    const columns: number[] = [];
    pattern.forEach((row, r) =>
      [...row].forEach((ch, c) => {
        if (ch !== "#") return;
        pixels.push(makePixel(pad + c * pitch + cell / 2, pad + r * pitch + cell / 2, cell));
        columns.push(c);
      }),
    );
    // A falling pixel waits for its column's turn; it holds still above the sheet.
    const wait = pixels.map((_, i) => (from === "above" ? columns[i]! * 0.045 + rand() * 0.05 : 0));
    const reduced = prefersReduced();
    if (reduced || !assemble) {
      drawPixels(ctx, pixels, color, W, H);
    } else {
      // Start as a loose cloud below the picture; assembly waits for the viewport.
      pixels.forEach((p) => {
        if (from === "above") {
          p.x = p.tx + (rand() - 0.5) * cell * 2;
          p.y = p.ty - H * (0.9 + rand() * 0.5);
          p.a = (rand() - 0.5) * 120;
          p.o = 0;
        } else {
          p.x = p.tx + (rand() - 0.5) * W * 0.9;
          p.y = H + rand() * H * 0.6;
          p.a = rand() * 180;
          p.o = 0;
        }
      });
      drawPixels(ctx, pixels, color, W, H);
    }
    if (reduced) return;

    let pointer: { x: number; y: number } | null = null;
    let stop: (() => void) | null = null;
    let arriving = false;
    let clock = 0;
    const run = () => {
      if (stop) return;
      stop = wake({
        step(dt) {
          if (!canvas.isConnected) return false;
          if (pointer) {
            for (const p of pixels) {
              const dx = p.x - pointer.x;
              const dy = p.y - pointer.y;
              const d = Math.hypot(dx, dy);
              if (d < PHYSICS.repel && d > 0.01) {
                const f = (1 - d / PHYSICS.repel) ** 2 * 5200;
                p.vx += (dx / d) * f * dt;
                p.vy += (dy / d) * f * dt;
                p.va += (dx > 0 ? 1 : -1) * f * 0.12 * dt;
              }
            }
          }
          clock += dt;
          pixels.forEach((p, i) => {
            if (clock < wait[i]!) return;
            if (arriving && p.o < 1) p.o = Math.min(1, p.o + dt * 6);
            stepPixel(p, dt);
          });
          color = getComputedStyle(canvas).color;
          drawPixels(ctx, pixels, color, W, H);
          if (!pointer && clock > 1 && energy(pixels) < 0.4) {
            stop = null;
            return false;
          }
          return true;
        },
      });
    };
    const arrive = () => {
      if (arriving) return;
      arriving = true;
      clock = 0;
      pixels.forEach((p, i) => {
        if (from === "above") {
          // Weight: a soft spring that overshoots once — the pixel lands and bounces.
          p.vy = 120 + rand() * 80;
          p.k = 300;
          p.c = 13;
        } else {
          p.vy -= 260 + rand() * 180;
          p.va += (rand() - 0.5) * PHYSICS.spin;
          p.k = PHYSICS.stiffness * (0.7 + (i % 5) * 0.08);
        }
      });
      run();
    };
    let observer: IntersectionObserver | null = null;
    if (assemble) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            arrive();
            observer?.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      observer.observe(canvas);
    } else {
      arriving = true;
    }
    const position = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return { x: ((event.clientX - box.left) * W) / box.width, y: ((event.clientY - box.top) * H) / box.height };
    };
    const move = (event: PointerEvent) => {
      if (!arriving || event.pointerType === "touch") return;
      pointer = position(event);
      run();
    };
    const leave = () => {
      pointer = null;
    };
    const down = (event: PointerEvent) => {
      if (!arriving) return;
      const o = position(event);
      for (const p of pixels) {
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = PHYSICS.scatter * 2.2 * (0.5 + rand()) * Math.max(0.25, 1 - d / (W * 0.8));
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
        p.va += (rand() - 0.5) * 2 * PHYSICS.spin;
      }
      run();
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerdown", down);
    return () => {
      observer?.disconnect();
      stop?.();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", down);
    };
    // The pattern string is the identity of the picture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, cell, gap, pad, W, H, assemble, from]);

  return (
    <canvas
      ref={ref}
      className={[styles.field, className ?? ""].join(" ")}
      role="img"
      aria-label={label}
      style={{ width: W, aspectRatio: `${W} / ${H}` }}
    />
  );
}

/* -------------------------------------------------------------- PixelText */

/** 5 × 7 pixel figures for version numbers (the 0.3 film's lettering). */
const FIGURES: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  ".": [".", ".", ".", ".", ".", ".", "#"],
};

export function textPattern(text: string): string[] {
  const rows = Array.from({ length: 7 }, () => "");
  [...text].forEach((ch, index) => {
    const figure = FIGURES[ch];
    if (!figure) return;
    figure.forEach((row, r) => {
      rows[r] += (index ? "." : "") + row;
    });
  });
  return rows;
}

/** A version number made of pixels that fall in with weight and live under the pointer. */
export function PixelText({ text, cell = 14, label, className }: { text: string; cell?: number; label: string; className?: string }) {
  return <PixelField pattern={textPattern(text)} cell={cell} gap={Math.round(cell / 5)} padding={cell} label={label} className={className} from="above" />;
}

/* ---------------------------------------------------------- PixelProgress */

/** A row of pixel cells; filled ones are ink, empty ones are faint and small. */
export function PixelProgress({ value, cells = 12, label }: { value: number; cells?: number; label: string }) {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * cells);
  return (
    <span className={styles.progress} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
      {Array.from({ length: cells }, (_, index) => (
        <i key={index} data-on={index < filled} style={{ "--i": index } as React.CSSProperties} />
      ))}
    </span>
  );
}

/** Throws a burst of pixels from where the pointer pressed — confirmations only. */
export function burstFrom(event: React.MouseEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  burst(event.clientX || box.left + box.width / 2, event.clientY || box.top + box.height / 2);
}
