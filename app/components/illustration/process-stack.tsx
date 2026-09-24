"use client";

import { useEffect, useRef, useState } from "react";
import { IsoBox, project } from "./iso";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import styles from "./process-stack.module.css";

type Layer = { id: string; title: string; text: string };

const SLAB = { w: 420, d: 300, h: 14 };
const GAP = 86;

const tint: Record<string, { top: string; left: string; right: string; edge: string }> = {
  window: { top: "rgba(243,239,230,.16)", left: "rgba(243,239,230,.1)", right: "rgba(243,239,230,.14)", edge: "rgba(255,255,255,.45)" },
  runtime: { top: "rgba(255,181,43,.16)", left: "rgba(255,181,43,.1)", right: "rgba(255,181,43,.13)", edge: "rgba(255,194,71,.6)" },
  oscar: { top: "rgba(255,122,24,.15)", left: "rgba(255,122,24,.09)", right: "rgba(255,122,24,.12)", edge: "rgba(255,150,70,.55)" },
  safe: { top: "rgba(154,160,168,.16)", left: "rgba(154,160,168,.1)", right: "rgba(154,160,168,.13)", edge: "rgba(200,205,212,.5)" },
};

/**
 * The five Monarch processes as an exploded stack of glass slabs.
 * Four live in the app; Security stands apart, as it does in reality.
 */
export function ProcessStack({ layers }: { layers: readonly Layer[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion()) return; // CSS shows the stack open
    const { ScrollTrigger } = getGsap();
    const trigger = ScrollTrigger.create({ trigger: node, start: "top 70%", once: true, onEnter: () => setOpen(true) });
    return () => trigger.kill();
  }, []);

  const stack = layers.filter((layer) => layer.id !== "security");
  const security = layers.find((layer) => layer.id === "security");

  return (
    <div ref={ref} className={styles.wrap} data-open={open}>
      <svg viewBox="-460 -150 1100 640" className={styles.svg} role="img" aria-label={layers.map((layer) => layer.title).join(", ")}>
        {stack.map((layer, index) => {
          const colors = tint[layer.id]!;
          const label = project(0, SLAB.d, SLAB.h);
          return (
            <g
              key={layer.id}
              className={styles.slab}
              style={{ "--lift": `${(stack.length - 1 - index) * GAP}px`, "--i": index } as React.CSSProperties}
              data-dim={focus !== null && focus !== layer.id}
              onMouseEnter={() => setFocus(layer.id)}
              onMouseLeave={() => setFocus(null)}
            >
              <g className={styles.slabInner}>
                <IsoBox x={0} y={0} z={0} w={SLAB.w} d={SLAB.d} h={SLAB.h} style={{ top: colors.top, left: colors.left, right: colors.right, stroke: colors.edge, strokeWidth: 1 }} />
                <SlabGlyph id={layer.id} />
              </g>
              <g className={styles.label}>
                <g transform={`translate(${label[0] - 16} ${label[1] - 6})`}>
                  <line x1="4" y1="0" x2="26" y2="0" stroke="rgba(255,255,255,.3)" />
                  <text className={styles.labelTitle} textAnchor="end">
                    {layer.title}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
        {security && (
          <g className={styles.tower} data-dim={focus !== null && focus !== "security"} onMouseEnter={() => setFocus("security")} onMouseLeave={() => setFocus(null)}>
            <IsoBox x={600} y={-30} z={0} w={70} d={70} h={250} style={{ top: "rgba(105,211,152,.2)", left: "rgba(105,211,152,.08)", right: "rgba(105,211,152,.13)", stroke: "rgba(105,211,152,.6)", strokeWidth: 1 }} />
            <g transform={`translate(${project(635, 5, 250)[0]} ${project(635, 5, 250)[1] - 40})`}>
              <path d="M0 -18 L14 -13 V-3 C14 6 8 11 0 14 C-8 11 -14 6 -14 -3 V-13 Z" fill="none" stroke="#69d398" strokeWidth="2" />
              <text y="-30" className={styles.labelTitle} textAnchor="middle">
                {security.title}
              </text>
            </g>
          </g>
        )}
      </svg>

      <ul className={styles.legend}>
        {layers.map((layer) => (
          <li key={layer.id} data-id={layer.id} data-active={focus === layer.id} onMouseEnter={() => setFocus(layer.id)} onMouseLeave={() => setFocus(null)}>
            <h3>{layer.title}</h3>
            <p>{layer.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlabGlyph({ id }: { id: string }) {
  // A small mark engraved in the centre of each slab.
  const [cx, cy] = project(SLAB.w / 2, SLAB.d / 2, SLAB.h);
  const glyph: Record<string, React.ReactNode> = {
    window: <path d="M-26 -16 h52 v32 h-52 Z M-26 -8 h52" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" />,
    runtime: (
      <g fill="none" stroke="#ffc247" strokeWidth="2">
        <rect x="-18" y="-18" width="36" height="36" rx="4" />
        <path d="M-10 -26 v8 M0 -26 v8 M10 -26 v8 M-10 18 v8 M0 18 v8 M10 18 v8 M-26 -10 h8 M-26 0 h8 M-26 10 h8 M18 -10 h8 M18 0 h8 M18 10 h8" />
      </g>
    ),
    oscar: <path d="M-16 8 C-16 -12 16 -12 16 8 M-16 8 h32 M-10 -6 l-4 -12 l10 6 M10 -6 l4 -12 l-10 6" fill="none" stroke="#ff9a4a" strokeWidth="2" strokeLinejoin="round" />,
    safe: (
      <g fill="none" stroke="#c9ced5" strokeWidth="2">
        <circle r="18" />
        <circle r="6" />
        <path d="M0 -18 v6 M0 12 v6 M-18 0 h6 M12 0 h6" />
      </g>
    ),
  };
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 0.58)`} opacity=".9">
      {glyph[id]}
    </g>
  );
}
