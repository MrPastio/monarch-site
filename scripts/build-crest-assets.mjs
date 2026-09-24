/**
 * Builds the crest geometry sources from the owner-approved trace of the
 * Monarch logo (scripts/source/crest-paths.grok.json, traced 1:1 from the
 * official 1254×1254 artwork).
 *
 * Refinement only — the shapes are never redrawn:
 *  1. Ramer–Douglas–Peucker removes trace jitter so straight edges are
 *     straight (clean bevels in 3D, crisp edges in SVG) while curves keep
 *     their points.
 *  2. Outputs cleaned polygons for the 3D builder and SVG path strings for
 *     the 2D mark, both in the artwork's own pixel space.
 *
 * Run: node scripts/build-crest-assets.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(readFileSync(join(root, "scripts/source/crest-paths.grok.json"), "utf8"));

const EPSILON = 0.45;

function perpendicular([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / length;
}

function rdp(points, epsilon) {
  if (points.length < 3) return points;
  let index = 0;
  let max = 0;
  const last = points.length - 1;
  for (let i = 1; i < last; i++) {
    const distance = perpendicular(points[i], points[0], points[last]);
    if (distance > max) {
      index = i;
      max = distance;
    }
  }
  if (max <= epsilon) return [points[0], points[last]];
  const left = rdp(points.slice(0, index + 1), epsilon);
  const right = rdp(points.slice(index), epsilon);
  return [...left.slice(0, -1), ...right];
}

/** RDP for a closed ring: split at the two farthest-apart points. */
function simplifyRing(ring) {
  let points = ring.map(([x, y]) => [x, y]);
  const first = points[0];
  const lastPoint = points[points.length - 1];
  if (first[0] === lastPoint[0] && first[1] === lastPoint[1]) points = points.slice(0, -1);
  if (points.length < 12) return points;
  let far = 0;
  let farDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const distance = Math.hypot(points[i][0] - points[0][0], points[i][1] - points[0][1]);
    if (distance > farDistance) {
      far = i;
      farDistance = distance;
    }
  }
  const a = rdp(points.slice(0, far + 1), EPSILON);
  const b = rdp([...points.slice(far), points[0]], EPSILON);
  return [...a.slice(0, -1), ...b.slice(0, -1)].map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
}

/**
 * Circuit-node holes are true circles in the artwork; the trace approximates
 * them with a few dozen jittery points. Fit the circle and emit it exactly.
 */
function fitCircle(ring) {
  // Centre from the bounding box: trace points are unevenly spaced, so a
  // plain centroid drifts toward the dense side.
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const radii = ring.map(([x, y]) => Math.hypot(x - cx, y - cy));
  const sorted = [...radii].sort((a, b) => a - b);
  const r = sorted[Math.floor(sorted.length / 2)];
  // Robust to a stray trace point: judge by the mean deviation from the median radius.
  const meanDeviation = radii.reduce((sum, value) => sum + Math.abs(value - r), 0) / radii.length;
  const round = ring.length >= 12 && meanDeviation < 1.5 && r > 6 && r < 40;
  if (!round) return null;
  return Array.from({ length: 72 }, (_, i) => {
    const angle = (i / 72) * Math.PI * 2;
    return [Math.round((cx + Math.cos(angle) * r) * 100) / 100, Math.round((cy + Math.sin(angle) * r) * 100) / 100];
  });
}

/**
 * The circuit nodes are rings: a circular hole inside a circular outline.
 * The trace describes the outer arc with a handful of points, which shows
 * up as facets in close-ups. For every circular hole, find the run of outer
 * points that sit on a common radius around its centre and replace the run
 * with a dense exact arc.
 */
function circleOf(ring) {
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return { cx, cy };
}

function roundOuterArcs(outer, holes) {
  let points = outer;
  for (const hole of holes) {
    const { cx, cy } = circleOf(hole);
    const dist = ([x, y]) => Math.hypot(x - cx, y - cy);
    const holeR = dist(hole[0]);
    // Outer radius: the most common distance of nearby outline points.
    const near = points.map(dist).filter((d) => d > holeR + 3 && d < holeR + 24).sort((a, b) => a - b);
    if (near.length < 4) continue;
    const ringR = near[Math.floor(near.length / 2)];
    const onArc = points.map((p) => Math.abs(dist(p) - ringR) < 2.2);
    // Longest cyclic run of arc points.
    const n = points.length;
    let bestStart = -1;
    let bestLength = 0;
    for (let start = 0; start < n; start++) {
      if (!onArc[start] || onArc[(start - 1 + n) % n]) continue;
      let length = 0;
      while (length < n && onArc[(start + length) % n]) length++;
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
    }
    if (bestLength < 3) continue;
    const first = points[bestStart];
    const last = points[(bestStart + bestLength - 1) % n];
    const a0 = Math.atan2(first[1] - cy, first[0] - cx);
    const a1 = Math.atan2(last[1] - cy, last[0] - cx);
    // Walk the same way the original run walks.
    const mid = points[(bestStart + Math.floor(bestLength / 2)) % n];
    const am = Math.atan2(mid[1] - cy, mid[0] - cx);
    const norm = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const ccw = norm(am - a0) < norm(a1 - a0);
    const sweep = ccw ? norm(a1 - a0) : -norm(a0 - a1);
    const steps = Math.max(8, Math.ceil(Math.abs(sweep) / (Math.PI / 60)));
    const arc = Array.from({ length: steps + 1 }, (_, i) => {
      const a = a0 + (sweep * i) / steps;
      return [Math.round((cx + Math.cos(a) * ringR) * 100) / 100, Math.round((cy + Math.sin(a) * ringR) * 100) / 100];
    });
    const rest = [];
    for (let i = 0; i < n - bestLength; i++) rest.push(points[(bestStart + bestLength + i) % n]);
    points = [...arc, ...rest];
  }
  return points;
}

const cleanPart = (part) => {
  const holes = part.holes.map((hole) => fitCircle(hole) ?? simplifyRing(hole));
  const circular = holes.filter((hole, i) => fitCircle(part.holes[i]) !== null);
  return {
    outer: roundOuterArcs(simplifyRing(part.outer), circular),
    holes,
  };
};

const cleaned = {
  size: source.width,
  white: source.white.map(cleanPart),
  gold: source.gold.map(cleanPart),
};

let before = 0;
let after = 0;
for (const kind of ["white", "gold"]) {
  source[kind].forEach((part, i) => {
    before += part.outer.length + part.holes.reduce((n, h) => n + h.length, 0);
    after += cleaned[kind][i].outer.length + cleaned[kind][i].holes.reduce((n, h) => n + h.length, 0);
  });
}

// Bounds of the whole crest in artwork pixels.
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const part of [...cleaned.white, ...cleaned.gold]) {
  for (const [x, y] of part.outer) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
}
cleaned.bounds = { minX, minY, maxX, maxY };

writeFileSync(join(root, "app/assets/crest-paths.json"), JSON.stringify(cleaned));

const ringToPath = (ring) =>
  `M${ring.map(([x, y]) => `${(x - minX).toFixed(1)} ${(y - minY).toFixed(1)}`).join("L")}Z`;
const partToPath = (part) => [part.outer, ...part.holes].map(ringToPath).join("");

const svgModule = `// Generated by scripts/build-crest-assets.mjs — do not edit by hand.
// Paths come from the 1:1 trace of the official Monarch artwork.
export const crestViewBox = "0 0 ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}";
export const crestAspect = ${((maxY - minY) / (maxX - minX)).toFixed(4)};
export const crestShield = ${JSON.stringify(partToPath(cleaned.white[0]))};
export const crestTrunk = ${JSON.stringify(partToPath(cleaned.white[1]))};
export const crestCrown = ${JSON.stringify(cleaned.gold.map(partToPath).join(""))};
`;
writeFileSync(join(root, "app/components/brand/crest-paths.ts"), svgModule);

console.log(`points ${before} -> ${after}; bounds ${minX},${minY} – ${maxX},${maxY}`);
