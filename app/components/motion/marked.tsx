"use client";

import { useEffect, useRef, useState } from "react";

/** Renders `*word*` as a highlighter mark; everything else stays plain text. */
export function Marked({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={index} className="mark">
            {part.slice(1, -1)}
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
