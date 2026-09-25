"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/components/motion/gsap";
import type { CrestHandle } from "@/components/scenes/hero/crest-renderer";
import { asset } from "@/lib/asset";
import styles from "./crest-stage.module.css";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The owner's crest, live. It is mounted when the stage comes near the
 * viewport, so its one assembly happens in front of the reader, then it only
 * answers the pointer.
 */
export function CrestStage({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = useRef<CrestHandle | null>(null);
  const [mode, setMode] = useState<"waiting" | "live" | "poster">("waiting");

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if (!supportsWebGL()) return setMode("poster");
        try {
          const { mountCrest } = await import("@/components/scenes/hero/crest-renderer");
          if (cancelled) return;
          const crest = await mountCrest({
            container,
            reducedMotion: prefersReducedMotion(),
            anchorX: () => 0,
            fill: () => 0.84,
            onReady: () => !cancelled && setMode("live"),
          });
          if (cancelled) return crest.dispose();
          handle.current = crest;
        } catch {
          if (!cancelled) setMode("poster");
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
      handle.current?.dispose();
      handle.current = null;
    };
  }, []);

  return (
    <div ref={ref} className={styles.stage} data-mode={mode} role="img" aria-label={label}>
      {mode === "poster" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.poster} src={asset("/brand/logo-dark.webp")} alt="" width={960} height={960} />
      )}
    </div>
  );
}
