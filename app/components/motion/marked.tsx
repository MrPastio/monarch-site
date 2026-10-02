"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A hand-drawn pencil line under the word: a slightly uneven stroke in
 * graphite, drawn once from left to right when its line is lit — the way the
 * 0.3 film underlines a caption. Its wobble is seeded by the word, so the
 * server and the client draw the same line.
 */
export function Pencil({ seed }: { seed: string }) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const j = (k: number) => (((h >>> (k * 4)) & 15) / 15 - 0.5) * 2;
  const d = `M3,${10 + j(0) * 2} C${90 + j(1) * 20},${4 + j(2) * 2} ${230 + j(3) * 30},${15 + j(4) * 2} ${397},${7 + j(5) * 2.5}`;
  return (
    <svg className="pencil" viewBox="0 0 400 18" preserveAspectRatio="none" aria-hidden focusable="false">
      <path d={d} pathLength={1} />
    </svg>
  );
}

/** Renders `*word*` as a pencil-underlined mark; everything else stays plain text. */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={index} className="mark">
            {part.slice(1, -1)}
            <Pencil seed={part} />
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

/** Plain text of a marked string, for labels and metadata. */
export const unmark = (text: string) => text.replace(/\*/g, "");

/**
 * `data-unlit` until the element is well inside the viewport, then the marks
 * are drawn once. Reduced motion draws them instantly; without scripts CSS
 * (`scripting: none`) shows them drawn.
 */
export function useLit<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLit(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, unlit: lit ? undefined : "" };
}
