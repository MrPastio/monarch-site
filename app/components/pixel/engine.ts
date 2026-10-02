/*
 * PaperPixel physics for the site — a port of the app's modules/paper-pixel.js
 * and the PaperPixel design system bundle. One owner for every animated pixel:
 * a single requestAnimationFrame ticker drives all actors and sleeps when none
 * are awake. Units are px and seconds; semi-implicit Euler, dt ≤ 33 ms.
 */

export type Pixel = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  tx: number;
  ty: number;
  ta: number;
  s: number;
  o: number;
  k: number;
  c: number;
  free: boolean;
};

export const PHYSICS = {
  stiffness: 240,
  damping: 18,
  snap: 520,
  snapDamping: 34,
  gravity: 2200,
  scatter: 380,
  spin: 720,
  repel: 72,
} as const;

export function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function rng(seed: number) {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const quarterDiff = (a: number, b: number) => {
  let d = (a - b) % 90;
  if (d > 45) d -= 90;
  if (d < -45) d += 90;
  return d;
};

export function makePixel(x: number, y: number, size: number): Pixel {
  return { x, y, vx: 0, vy: 0, a: 0, va: 0, tx: x, ty: y, ta: 0, s: size, o: 1, k: PHYSICS.stiffness, c: PHYSICS.damping, free: false };
}

/** Spring toward (tx, ty, ta); a square is symmetric every 90°. Free pixels fall. */
export function stepPixel(p: Pixel, dt: number, gravity = 0) {
  if (p.free) {
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.a += p.va * dt;
    return;
  }
  p.vx += (-p.k * (p.x - p.tx) - p.c * p.vx) * dt;
  p.vy += (-p.k * (p.y - p.ty) - p.c * p.vy) * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.va += (-p.k * quarterDiff(p.a, p.ta) - p.c * p.va) * dt;
  p.a += p.va * dt;
}

export function energy(pixels: Pixel[]): number {
  return pixels.reduce((e, p) => e + Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.x - p.tx) + Math.abs(p.y - p.ty), 0);
}

export function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function drawPixels(ctx: CanvasRenderingContext2D, pixels: Pixel[], color: string, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color;
  for (const p of pixels) {
    if (p.o <= 0.01) continue;
    const s = p.s;
    const r = s * 0.28;
    const x = -s / 2;
    const y = -s / 2;
    ctx.save();
    ctx.globalAlpha = p.o;
    ctx.translate(p.x, p.y);
    ctx.rotate((p.a * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + s, y, x + s, y + s, r);
    ctx.arcTo(x + s, y + s, x, y + s, r);
    ctx.arcTo(x, y + s, x, y, r);
    ctx.arcTo(x, y, x + s, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/* ------------------------------------------------------------ the one ticker */

type Actor = { step: (dt: number) => boolean | void };
const actors = new Set<Actor>();
let frame = 0;
let last = 0;

function tick(now: number) {
  const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
  last = now;
  for (const actor of [...actors]) {
    if (actor.step(dt) === false) actors.delete(actor);
  }
  frame = actors.size ? requestAnimationFrame(tick) : 0;
}

/** Wake an actor; it runs every frame until its step returns false. Returns a stopper. */
export function wake(actor: Actor): () => void {
  actors.add(actor);
  if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  return () => actors.delete(actor);
}

/* ----------------------------------------------------------------- burst */

/** A handful of pixels thrown from (x, y) that fall under gravity. Confirmations only. */
export function burst(x: number, y: number, { count = 10, size = 8, color }: { count?: number; size?: number; color?: string } = {}) {
  if (typeof document === "undefined" || prefersReduced()) return;
  const W = 220;
  const H = 220;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = `position:fixed;pointer-events:none;z-index:100;left:${x - W / 2}px;top:${y - H / 2}px;width:${W}px;height:${H}px`;
  document.body.append(canvas);
  const ctx = setupCanvas(canvas, W, H);
  if (!ctx) {
    canvas.remove();
    return;
  }
  const ink = color || getComputedStyle(document.documentElement).getPropertyValue("--pp-ink").trim() || "#0b0b0b";
  const rand = rng(Math.floor(x * 131 + y * 17 + performance.now()));
  const pixels = Array.from({ length: count }, () => {
    const p = makePixel(W / 2, H / 2, size * (0.6 + rand() * 0.5));
    const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 1.1;
    const speed = PHYSICS.scatter * (0.7 + rand() * 0.9);
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.va = (rand() - 0.5) * 2 * PHYSICS.spin;
    p.a = rand() * 90;
    p.free = true;
    return p;
  });
  let t = 0;
  wake({
    step(dt) {
      t += dt;
      const k = t / 0.62;
      for (const p of pixels) {
        stepPixel(p, dt, PHYSICS.gravity);
        p.o = Math.min(1, Math.max(0, 1.4 - k * 1.4));
      }
      drawPixels(ctx, pixels, ink, W, H);
      if (k >= 1) {
        canvas.remove();
        return false;
      }
      return true;
    },
  });
}

/* ---------------------------------------------------------------- glyphs */

/** The PaperPixel 7 × 7 glyph set (design system `PaperPixel.glyphs`). */
export const GLYPHS = {
  check: [".......", ".....##", "....##.", "##.##..", ".###...", "..#....", "......."],
  cross: [".......", ".#...#.", "..#.#..", "...#...", "..#.#..", ".#...#.", "......."],
  alert: ["...#...", "...#...", "...#...", "...#...", ".......", "...#...", "......."],
  info: ["...#...", ".......", "..##...", "...#...", "...#...", "...#...", "..###.."],
  plus: [".......", "...#...", "...#...", ".#####.", "...#...", "...#...", "......."],
  minus: [".......", ".......", ".......", ".#####.", ".......", ".......", "......."],
  "arrow-right": ["...#...", "....#..", ".....#.", "#######", ".....#.", "....#..", "...#..."],
  "arrow-left": ["...#...", "..#....", ".#.....", "#######", ".#.....", "..#....", "...#..."],
  "arrow-up": ["...#...", "..###..", ".#.#.#.", "#..#..#", "...#...", "...#...", "...#..."],
  "arrow-down": ["...#...", "...#...", "...#...", "#..#..#", ".#.#.#.", "..###..", "...#..."],
  "chevron-right": ["..#....", "...#...", "....#..", ".....#.", "....#..", "...#...", "..#...."],
  "chevron-left": ["....#..", "...#...", "..#....", ".#.....", "..#....", "...#...", "....#.."],
  "chevron-up": [".......", "...#...", "..#.#..", ".#...#.", "#.....#", ".......", "......."],
  "chevron-down": [".......", ".......", "#.....#", ".#...#.", "..#.#..", "...#...", "......."],
  dot: [".......", ".......", "..###..", "..###..", "..###..", ".......", "......."],
  search: [".###...", "#...#..", "#...#..", "#...#..", ".###...", ".....#.", "......#"],
  heart: [".......", ".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  spark: ["...#...", "...#...", "..###..", "#######", "..###..", "...#...", "...#..."],
  clock: ["..###..", ".#...#.", "#..#..#", "#..##.#", "#.....#", ".#...#.", "..###.."],
  lock: ["..###..", ".#...#.", ".#...#.", "#######", "###.###", "###.###", "#######"],
  menu: [".......", "#######", ".......", "#######", ".......", "#######", "......."],
  copy: ["####...", "#..#...", "#..####", "####..#", "...#..#", "...#..#", "...####"],
  user: ["..###..", ".#####.", "..###..", ".......", "..###..", ".#####.", "#######"],
  home: ["...#...", "..###..", ".#####.", "#######", ".##.##.", ".##.##.", ".##.##."],
  folder: [".......", "###....", "#######", "#.....#", "#.....#", "#.....#", "#######"],
  send: ["...#...", "..###..", ".#.#.#.", "#..#..#", "...#...", "...#...", "...#..."],
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function glyphCells(rows: readonly string[]): [number, number][] {
  const out: [number, number][] = [];
  rows.forEach((row, r) => [...row].forEach((cell, c) => cell === "#" && out.push([c, r])));
  return out;
}
