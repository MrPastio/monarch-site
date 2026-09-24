import { crestCrown, crestShield, crestTrunk } from "@/components/brand/crest-paths";
import { IsoBox, IsoCylinder, isoPath, planeTransform, project, type Point } from "./iso";
import styles from "./motherboard.module.css";

/**
 * «На твоём железе» — an isometric motherboard drawn in code.
 * Every part lives on the board plane; nothing here is a stock image.
 *
 * `fill` (0–1) is the share of memory the chosen model occupies; `sticks`
 * is how many RAM modules are installed.
 */
export type MotherboardLabels = {
  cpu: string;
  ram: string;
  ssd: string;
  ssdNote: string;
  net: string;
  netNote: string;
  model: string;
};

const BOARD = { w: 660, d: 450, h: 12 };
const RAM = { x: 452, y: 70, w: 9, d: 280, h: 58, gap: 24 };

const metal = { top: "url(#mb-steel)", left: "#5b6068", right: "#7a8089", stroke: "rgba(255,255,255,.18)", strokeWidth: 0.5 };
const dark = { top: "#1b1e23", left: "#0e1013", right: "#15171b", stroke: "rgba(255,255,255,.07)" };
const stickStyle = { top: "#2a2e35", left: "#16181c", right: "#1d2025", stroke: "rgba(255,255,255,.08)" };

const pts = (list: Point[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function stickFace(index: number): Point[] {
  const x = RAM.x + index * RAM.gap + RAM.w;
  const y0 = RAM.y + 8;
  const y1 = RAM.y + RAM.d - 8;
  const z0 = 10;
  const z1 = RAM.h - 6;
  return [project(x, y0, z1), project(x, y1, z1), project(x, y1, z0), project(x, y0, z0)];
}

function chips(index: number) {
  const x = RAM.x + index * RAM.gap + RAM.w + 0.2;
  const list: Point[][] = [];
  for (let i = 0; i < 8; i++) {
    const y = RAM.y + 18 + i * 32;
    list.push([project(x, y, 44), project(x, y + 24, 44), project(x, y + 24, 22), project(x, y, 22)]);
  }
  return list;
}

const traces: [number, number][][] = [
  // CPU → memory bus
  ...[0, 1, 2, 3, 4, 5].map((i): [number, number][] => [
    [392, 176 + i * 16],
    [420, 176 + i * 16],
    [430, 150 + i * 30],
    [RAM.x - 4, 150 + i * 30],
  ]),
  // CPU → chipset → SSD
  [
    [248, 250],
    [210, 250],
    [210, 226],
  ],
  [
    [150, 280],
    [150, 330],
    [170, 350],
  ],
  [
    [262, 300],
    [262, 330],
    [235, 352],
  ],
];

const netTrace: [number, number][] = [
  [150, 170],
  [150, 90],
  [240, 60],
  [560, 60],
  [575, 72],
];

export function Motherboard({
  labels,
  sticks,
  fill,
  modelName,
}: {
  labels: MotherboardLabels;
  sticks: number;
  fill: number;
  modelName: string;
}) {
  const boardTop: Point[] = [
    project(0, 0, BOARD.h),
    project(BOARD.w, 0, BOARD.h),
    project(BOARD.w, BOARD.d, BOARD.h),
    project(0, BOARD.d, BOARD.h),
  ];
  const cpuCenter = project(315, 215, BOARD.h + 34);
  const ssdCenter = project(170, 372, BOARD.h + 8);
  const netCenter = project(600, 60, BOARD.h + 44);
  const ramLabel = project(RAM.x + 40, RAM.y, BOARD.h + RAM.h + 6);

  return (
    <svg className={styles.board} viewBox="-420 -70 1020 640" role="img" aria-label={`${labels.cpu}, ${labels.ram}, ${labels.ssd}, ${labels.net}`}>
      <defs>
        <linearGradient id="mb-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#15181d" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id="mb-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef1f4" />
          <stop offset=".45" stopColor="#b9bec5" />
          <stop offset="1" stopColor="#8b9199" />
        </linearGradient>
        <linearGradient id="mb-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe29a" />
          <stop offset=".55" stopColor="#e1ad33" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
        <radialGradient id="mb-pool" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="rgba(255,190,90,.14)" />
          <stop offset="1" stopColor="rgba(255,190,90,0)" />
        </radialGradient>
        <pattern id="mb-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke="rgba(255,255,255,.035)" strokeWidth="1" />
        </pattern>
        {[0, 1, 2, 3].map((i) => (
          <clipPath key={i} id={`mb-face-${i}`}>
            <polygon points={pts(stickFace(i))} />
          </clipPath>
        ))}
      </defs>

      {/* Board */}
      <g data-part="board">
        <ellipse cx={project(330, 225).at(0)} cy={project(330, 225).at(1)! + 30} rx="520" ry="300" fill="url(#mb-pool)" />
        <IsoBox x={0} y={0} w={BOARD.w} d={BOARD.d} h={BOARD.h} style={{ top: "url(#mb-top)", left: "#07080a", right: "#0a0b0e", stroke: "rgba(255,255,255,.08)" }} />
        <g transform={planeTransform(0, 0, BOARD.h)} opacity="1">
          <rect width={BOARD.w} height={BOARD.d} fill="url(#mb-grid)" />
        </g>
        <polygon points={pts(boardTop)} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1" />
        {/* mounting holes */}
        {[
          [24, 24],
          [BOARD.w - 24, 24],
          [24, BOARD.d - 24],
          [BOARD.w - 24, BOARD.d - 24],
        ].map(([x, y]) => (
          <IsoCylinder key={`${x}-${y}`} x={x!} y={y!} z={BOARD.h} r={7} h={1} body="#2a2d33" cap="#3a3e45" rim="rgba(255,255,255,.2)" />
        ))}
      </g>

      {/* Traces */}
      <g data-part="traces" className={styles.traces}>
        {traces.map((trace, index) => (
          <path key={index} d={isoPath(trace, BOARD.h)} pathLength={1} className={styles.trace} style={{ "--i": index } as React.CSSProperties} />
        ))}
        <path d={isoPath(netTrace, BOARD.h)} className={styles.netTrace} />
      </g>

      {/* Chipset with heatsink fins */}
      <g data-part="chipset">
        <IsoBox x={110} y={150} w={90} d={80} h={8} style={dark} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <IsoBox key={i} x={116 + i * 12} y={156} w={5} d={68} h={22} style={{ top: "#9aa0a8", left: "#3e434a", right: "#5a6068", stroke: "rgba(255,255,255,.12)", strokeWidth: 0.4 }} />
        ))}
      </g>

      {/* SSD */}
      <g data-part="ssd">
        <IsoBox x={60} y={350} w={230} d={44} h={5} style={{ top: "#171a1f", left: "#0c0d10", right: "#101216", stroke: "rgba(255,255,255,.1)" }} />
        {[0, 1, 2].map((i) => (
          <IsoBox key={i} x={92 + i * 58} y={358} w={44} d={28} h={3} style={dark} z={5} />
        ))}
        <IsoBox x={276} y={352} w={12} d={40} h={4} style={{ top: "url(#mb-gold)", left: "#8a6214", right: "#b8861f" }} z={1} />
      </g>

      {/* Capacitors around the socket */}
      <g data-part="caps">
        {[
          [236, 136],
          [236, 164],
          [236, 192],
          [236, 300],
          [264, 318],
          [292, 318],
          [372, 124],
          [400, 124],
        ].map(([x, y]) => (
          <IsoCylinder key={`${x}-${y}`} x={x!} y={y!} z={BOARD.h} r={8} h={16} body="#2b2f36" cap="#5d636c" rim="rgba(255,255,255,.18)" />
        ))}
      </g>

      {/* CPU socket + heat spreader with the crest engraved */}
      <g data-part="cpu">
        <IsoBox x={246} y={146} w={140} d={140} h={6} z={BOARD.h} style={{ top: "#23262c", left: "#111316", right: "#181a1e", stroke: "rgba(255,255,255,.1)" }} />
        <IsoBox x={260} y={160} w={112} d={112} h={16} z={BOARD.h + 6} style={metal} />
        <g transform={`${planeTransform(316, 216, BOARD.h + 22)} rotate(-90) translate(-30 -45) scale(${60 / 549})`} opacity=".82">
          <g transform="rotate(0)">
            <path d={crestCrown} fill="#7d838c" fillRule="evenodd" />
            <path d={crestShield} fill="#6b7179" fillRule="evenodd" />
            <path d={crestTrunk} fill="#6b7179" fillRule="evenodd" />
          </g>
        </g>
      </g>

      {/* RAM */}
      <g data-part="ram">
        {[0, 1, 2, 3].map((i) => (
          <IsoBox key={`slot-${i}`} x={RAM.x + i * RAM.gap - 3} y={RAM.y - 6} w={RAM.w + 6} d={RAM.d + 12} h={5} z={BOARD.h} style={{ top: "#2d3138", left: "#15171b", right: "#1b1e22" }} />
        ))}
        {[0, 1, 2, 3].map((i) =>
          i < sticks ? (
            <g key={`stick-${i}`} className={styles.stick} style={{ "--i": i } as React.CSSProperties}>
              <IsoBox x={RAM.x + i * RAM.gap} y={RAM.y} w={RAM.w} d={RAM.d} h={RAM.h} z={BOARD.h} style={stickStyle} />
              <g clipPath={`url(#mb-face-${i})`} transform={`translate(0 ${-BOARD.h})`}>
                <polygon
                  className={styles.memoryFill}
                  points={pts(stickFace(i))}
                  fill="url(#mb-gold)"
                  style={{ transform: `translateY(${((1 - fill) * (RAM.h - 16)).toFixed(1)}px)` }}
                />
              </g>
              {chips(i).map((chip, index) => (
                <polygon key={index} points={pts(chip.map(([x, y]) => [x, y - BOARD.h]))} fill="#0d0e11" stroke="rgba(255,255,255,.06)" strokeWidth=".5" />
              ))}
              {/* gold edge contacts */}
              <polygon
                points={pts([
                  project(RAM.x + i * RAM.gap + RAM.w, RAM.y + 6, BOARD.h + 8),
                  project(RAM.x + i * RAM.gap + RAM.w, RAM.y + RAM.d - 6, BOARD.h + 8),
                  project(RAM.x + i * RAM.gap + RAM.w, RAM.y + RAM.d - 6, BOARD.h + 5),
                  project(RAM.x + i * RAM.gap + RAM.w, RAM.y + 6, BOARD.h + 5),
                ])}
                fill="#c9942a"
                opacity=".8"
              />
            </g>
          ) : null,
        )}
      </g>

      {/* Network port — closed until you say otherwise */}
      <g data-part="net">
        <IsoBox x={574} y={30} w={56} d={62} h={40} z={BOARD.h} style={metal} />
        <polygon
          points={pts([project(630, 44, BOARD.h + 30), project(630, 78, BOARD.h + 30), project(630, 78, BOARD.h + 10), project(630, 44, BOARD.h + 10)])}
          fill="#0a0b0d"
        />
        <g transform={`translate(${netCenter[0] + 58} ${netCenter[1] - 34})`}>
          <rect x="-15" y="-15" width="30" height="30" rx="9" fill="#101215" stroke="rgba(255,255,255,.16)" />
          <path d="M-5 -1 V-4 a5 5 0 0 1 10 0 V-1 M-7 -1 H7 V8 H-7 Z" fill="none" stroke="#ffc862" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      </g>

      {/* Labels */}
      <g className={styles.labels}>
        <Callout from={cpuCenter} to={[cpuCenter[0] - 150, cpuCenter[1] - 170]} title={labels.cpu} />
        <Callout from={ramLabel} to={[ramLabel[0] + 30, ramLabel[1] - 110]} title={labels.ram} note={`${labels.model}: ${modelName}`} accent />
        <Callout from={ssdCenter} to={[ssdCenter[0] - 90, ssdCenter[1] + 110]} title={labels.ssd} note={labels.ssdNote} below />
        <Callout from={[netCenter[0] + 58, netCenter[1] - 50]} to={[netCenter[0] + 58, netCenter[1] - 140]} title={labels.net} note={labels.netNote} />
      </g>
    </svg>
  );
}

function Callout({
  from,
  to,
  title,
  note,
  accent,
  below,
}: {
  from: Point;
  to: Point;
  title: string;
  note?: string;
  accent?: boolean;
  below?: boolean;
}) {
  return (
    <g className={styles.callout}>
      <path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} className={styles.leader} />
      <circle cx={from[0]} cy={from[1]} r="3" className={accent ? styles.dotAccent : styles.dot} />
      <text x={to[0]} y={below ? to[1] + 18 : to[1] - (note ? 26 : 8)} className={styles.labelTitle}>
        {title}
      </text>
      {note && (
        <text x={to[0]} y={below ? to[1] + 38 : to[1] - 8} className={accent ? styles.labelAccent : styles.labelNote}>
          {note}
        </text>
      )}
    </g>
  );
}
