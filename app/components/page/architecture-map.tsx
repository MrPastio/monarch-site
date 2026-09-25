"use client";

import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import { useLit } from "@/components/motion/marked";
import styles from "./architecture-map.module.css";

type Copy = Dict["pages"]["how"];
type Id = "window" | "runtime" | "oscar" | "safe" | "security";

// Boxes on a 1000 × 460 board (percentages derive from these).
const BOX: Record<Id, { x: number; y: number; w: number; h: number }> = {
  window: { x: 330, y: 24, w: 260, h: 70 },
  runtime: { x: 290, y: 186, w: 340, h: 88 },
  oscar: { x: 770, y: 197, w: 200, h: 66 },
  safe: { x: 30, y: 350, w: 200, h: 70 },
  security: { x: 740, y: 356, w: 230, h: 66 },
};

const LINKS: { id: string; from: Id; to: Id; d: string; label: keyof Copy["links"]; lx: number; ly: number; dashed?: boolean }[] = [
  { id: "ui", from: "window", to: "runtime", d: "M460 94 V186", label: "ui", lx: 474, ly: 144 },
  { id: "model", from: "runtime", to: "oscar", d: "M630 230 H770", label: "model", lx: 700, ly: 216 },
  { id: "watch", from: "security", to: "runtime", d: "M855 356 V312 H540 V274", label: "watch", lx: 600, ly: 302, dashed: true },
];

const RELATED: Record<Id, Id[]> = {
  window: ["runtime"],
  runtime: ["window", "oscar", "security"],
  oscar: ["runtime"],
  safe: [],
  security: ["runtime"],
};

/** The five processes and what connects them — and what never does. */
export function ArchitectureMap({ copy }: { copy: Copy }) {
  const [active, setActive] = useState<Id>("runtime");
  const { ref, unlit } = useLit<HTMLDivElement>();
  const process = copy.processes.find((item) => item.id === active)!;
  const linkOn = (from: Id, to: Id) => active === from || active === to;

  return (
    <div ref={ref} className={`card ${styles.root}`} data-unlit={unlit} data-active={active}>
      <p className={styles.hint}>{copy.processHint}</p>
      <div className={styles.board}>
        <svg className={styles.lines} viewBox="0 0 1000 460" aria-hidden>
          {LINKS.map((link) => (
            <g key={link.id} className={styles.link} data-on={linkOn(link.from, link.to)} data-dashed={link.dashed ? "" : undefined}>
              <path d={link.d} pathLength={1} />
              <text x={link.lx} y={link.ly} textAnchor={link.id === "model" ? "middle" : "start"}>
                {copy.links[link.label]}
              </text>
            </g>
          ))}
          <g className={styles.wall} data-on={active === "safe"}>
            <path d="M262 290 V446" pathLength={1} />
            <text x={274} y={440}>
              {copy.links.wall}
            </text>
          </g>
        </svg>

        {(Object.keys(BOX) as Id[]).map((id) => {
          const box = BOX[id];
          const item = copy.processes.find((entry) => entry.id === id)!;
          const related = RELATED[active].includes(id);
          return (
            <button
              key={id}
              type="button"
              className={styles.box}
              data-id={id}
              data-state={id === active ? "active" : related ? "related" : "idle"}
              aria-pressed={id === active}
              onClick={() => setActive(id)}
              style={
                {
                  left: `${box.x / 10}%`,
                  top: `${(box.y / 460) * 100}%`,
                  width: `${box.w / 10}%`,
                  height: `${(box.h / 460) * 100}%`,
                } as React.CSSProperties
              }
            >
              <span className={styles.boxTitle}>{item.title}</span>
              {id === "runtime" && <span className={styles.badge}>127.0.0.1</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.detail} key={active} aria-live="polite">
        <p className={styles.detailTitle}>{process.title}</p>
        <p className={styles.detailText}>{process.text}</p>
      </div>

      <ul className={styles.stacked}>
        {copy.processes.map((item) => (
          <li key={item.id} data-id={item.id}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
