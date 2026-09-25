"use client";

import { useState, useSyncExternalStore } from "react";
import { useLit } from "@/components/motion/marked";
import styles from "./principle-demos.module.css";

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (callback: () => void) => {
  const media = window.matchMedia(reducedQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

/** A small live proof for each design principle, in the same order as the copy. */
export function PrincipleDemo({
  index,
  layers,
  motionTry,
  reducedOn,
  reducedOff,
}: {
  index: number;
  layers: readonly string[];
  motionTry: string;
  reducedOn: string;
  reducedOff: string;
}) {
  if (index === 0) return <GlassDemo layers={layers} />;
  if (index === 1) return <WeightDemo />;
  if (index === 2) return <InterruptDemo label={motionTry} />;
  return <ReducedDemo on={reducedOn} off={reducedOff} />;
}

function GlassDemo({ layers }: { layers: readonly string[] }) {
  return (
    <div className={styles.stage} aria-hidden>
      <div className={styles.layers}>
        {layers.map((layer, index) => (
          <span key={layer} data-layer={index}>
            {layer}
          </span>
        ))}
      </div>
    </div>
  );
}

function WeightDemo() {
  const { ref, unlit } = useLit<HTMLDivElement>();
  return (
    <div ref={ref} className={styles.stage} data-unlit={unlit} aria-hidden>
      <span className={styles.floor} />
      <span className={styles.weight} />
    </div>
  );
}

function InterruptDemo({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className={styles.stage}>
      <button type="button" className={styles.switch} data-on={on} aria-pressed={on} onClick={() => setOn((value) => !value)}>
        <span className={styles.knob} />
      </button>
      <p className={styles.caption}>{label}</p>
    </div>
  );
}

function ReducedDemo({ on, off }: { on: string; off: string }) {
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );
  return (
    <div className={styles.stage}>
      <p className={styles.state} data-reduced={reduced}>
        <span className={styles.stateDot} />
        {reduced ? on : off}
      </p>
    </div>
  );
}
