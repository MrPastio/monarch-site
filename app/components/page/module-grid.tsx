"use client";

import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import styles from "./module-grid.module.css";

type Copy = Dict["pages"]["how"];

/**
 * All modules at once. Filtering keeps every tile in place — the ones outside
 * the group dim instead of disappearing, so the grid never jumps.
 */
export function ModuleGrid({ copy }: { copy: Copy }) {
  const [filter, setFilter] = useState("all");
  const visible = copy.modules.filter((module) => filter === "all" || module.group === filter).length;
  const count = copy.modulesCount.replace("{n}", String(visible)).replace("{total}", String(copy.modules.length));

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.filters} role="group" aria-label={copy.modulesTitle}>
          {copy.moduleFilters.map((item) => (
            <button key={item.id} type="button" aria-pressed={filter === item.id} className={styles.filter} onClick={() => setFilter(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <p className={styles.count} aria-live="polite">
          {count}
        </p>
      </div>
      <ul className={styles.grid}>
        {copy.modules.map((module, index) => {
          const on = filter === "all" || module.group === filter;
          return (
            <li key={module.id} data-on={on} data-group={module.group} style={{ "--i": index } as React.CSSProperties}>
              <code>{module.id}</code>
              <h3>{module.name}</h3>
              <p>{module.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
