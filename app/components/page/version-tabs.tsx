"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./version-tabs.module.css";

type Tab = { id: string; label: string; panel: ReactNode };

/**
 * Two views of one version: the notes and its patch builds. The panel comes in
 * from the side of the chosen tab and the marker slides under it; switching
 * again mid-way simply retargets both. Reduced motion swaps without movement.
 */
export function VersionTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (index: number) => {
    if (index === active) return;
    setDirection(index > active ? "right" : "left");
    setActive(index);
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (active + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    choose(next);
    refs.current[next]?.focus();
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.list} role="tablist" aria-label={label} onKeyDown={onKey}
        style={{ ["--tab-count" as string]: tabs.length, ["--tab-index" as string]: active }}>
        <span className={styles.marker} aria-hidden />
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === active ? 0 : -1}
            className={styles.tab}
            onClick={() => choose(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={`${tab.id}-${index === active ? active : "idle"}`}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== active}
          className={styles.panel}
          data-from={index === active ? direction : "none"}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
