/**
 * Tiny isometric toolkit for the site's illustrations.
 * Plane coordinates (x → right-down, y → left-down, z → up) are projected
 * with the classic 30° isometric axes.
 */
export const COS = 0.8660254;
export const SIN = 0.5;

export type Point = [number, number];

export function project(x: number, y: number, z = 0): Point {
  return [(x - y) * COS, (x + y) * SIN - z];
}

const pts = (points: Point[]) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** SVG transform that maps a flat drawing onto the plane at height z. */
export function planeTransform(ox = 0, oy = 0, z = 0) {
  const [sx, sy] = project(ox, oy, z);
  return `matrix(${COS} ${SIN} ${-COS} ${SIN} ${sx.toFixed(2)} ${sy.toFixed(2)})`;
}

export type BoxStyle = {
  top: string;
  left: string;
  right: string;
  stroke?: string;
  strokeWidth?: number;
};

/** A rectangular block: top face plus the two faces turned toward the viewer. */
export function IsoBox({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  style,
  className,
  children,
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  style: BoxStyle;
  className?: string;
  children?: React.ReactNode;
}) {
  const top = [project(x, y, z + h), project(x + w, y, z + h), project(x + w, y + d, z + h), project(x, y + d, z + h)];
  // Face along +y (lower-left on screen) and face along +x (lower-right).
  const left = [project(x, y + d, z + h), project(x + w, y + d, z + h), project(x + w, y + d, z), project(x, y + d, z)];
  const right = [project(x + w, y, z + h), project(x + w, y + d, z + h), project(x + w, y + d, z), project(x + w, y, z)];
  const stroke = style.stroke ?? "none";
  const sw = style.strokeWidth ?? 0.6;
  return (
    <g className={className}>
      <polygon points={pts(left)} fill={style.left} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={pts(right)} fill={style.right} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={pts(top)} fill={style.top} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {children}
    </g>
  );
}

/** Polyline lying on the plane at height z. */
export function isoPath(points: [number, number][], z = 0) {
  return points
    .map(([x, y], index) => {
      const [sx, sy] = project(x, y, z);
      return `${index ? "L" : "M"}${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");
}

/** Vertical cylinder (capacitor, standoff). */
export function IsoCylinder({
  x,
  y,
  z = 0,
  r,
  h,
  body,
  cap,
  rim,
}: {
  x: number;
  y: number;
  z?: number;
  r: number;
  h: number;
  body: string;
  cap: string;
  rim?: string;
}) {
  const [bx, by] = project(x, y, z);
  const [tx, ty] = project(x, y, z + h);
  const rx = r * COS * 1.414;
  const ry = r * SIN * 1.414;
  return (
    <g>
      <path d={`M${bx - rx} ${by} L${tx - rx} ${ty} L${tx + rx} ${ty} L${bx + rx} ${by} A${rx} ${ry} 0 0 1 ${bx - rx} ${by} Z`} fill={body} />
      <ellipse cx={tx} cy={ty} rx={rx} ry={ry} fill={cap} stroke={rim ?? "none"} strokeWidth={0.6} />
    </g>
  );
}
