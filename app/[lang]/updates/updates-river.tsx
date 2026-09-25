"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./updates.module.css";

export type RiverEntry = {
  version: string;
  display: string;
  href: string;
  state: "current" | "archive" | "revoked" | "history";
  stateLabel: string;
  date: string | null;
  major: boolean;
  title: string;
  summary: string;
  categories: readonly string[];
};

/**
 * The version river with a category filter. Entries outside the filter fold
 * up in place (grid rows 0fr) instead of vanishing, so the line stays whole.
 */
export function UpdatesRiver({
  entries,
  future,
  categories,
  filterAll,
  filterLabel,
  open,
}: {
  entries: RiverEntry[];
  future: { label: string; title: string; text: string };
  categories: Record<string, string>;
  filterAll: string;
  filterLabel: string;
  open: string;
}) {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "features", "fixes", "security"];

  return (
    <>
      <div className={styles.filters} role="group" aria-label={filterLabel}>
        <span className={styles.filterLabel}>{filterLabel}</span>
        {filters.map((id) => (
          <button key={id} type="button" aria-pressed={filter === id} className={styles.filter} onClick={() => setFilter(id)}>
            {id === "all" ? filterAll : categories[id]}
          </button>
        ))}
      </div>
      <ol className={styles.river}>
        <li className={styles.item} data-state="future" data-shown="true">
          <div className={styles.fold}>
            <div className={styles.foldInner}>
              <span className={styles.node} aria-hidden />
              <div className={styles.card}>
                <p className={styles.meta}>
                  <span className={styles.badge}>{future.label}</span>
                </p>
                <h2 className={styles.title}>{future.title}</h2>
                <p className={styles.summary}>{future.text}</p>
              </div>
            </div>
          </div>
        </li>
        {entries.map((entry) => {
          const shown = filter === "all" || entry.categories.includes(filter);
          return (
            <li key={entry.version} className={styles.item} data-state={entry.state} data-major={entry.major} data-shown={shown} inert={!shown}>
              <div className={styles.fold}>
                <div className={styles.foldInner}>
                  <span className={styles.node} aria-hidden />
                  <Link href={entry.href} className={styles.card}>
                    <p className={styles.meta}>
                      <span className={styles.version}>{entry.display}</span>
                      <span className={styles.badge}>{entry.stateLabel}</span>
                      {entry.date && <time>{entry.date}</time>}
                    </p>
                    <h2 className={styles.title}>{entry.title}</h2>
                    <p className={styles.summary}>{entry.summary}</p>
                    <p className={styles.tags}>
                      {entry.categories.map((category) => (
                        <span key={category}>{categories[category]}</span>
                      ))}
                    </p>
                    <span className={styles.open}>
                      {open} <span aria-hidden>→</span>
                    </span>
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
