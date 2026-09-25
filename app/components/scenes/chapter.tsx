"use client";

import { Marked, useLit } from "@/components/motion/marked";
import styles from "./chapter.module.css";

/** Shared chapter heading: index, kicker, title (with `*marks*`), lede. */
export function ChapterHead({
  index,
  kicker,
  title,
  lede,
  align = "start",
  id,
}: {
  index?: string;
  kicker: string;
  title: string;
  lede?: string;
  align?: "start" | "center";
  id?: string;
}) {
  const { ref, unlit } = useLit<HTMLElement>();
  return (
    <header ref={ref} className={styles.head} data-align={align} data-reveal data-unlit={unlit}>
      <p className={styles.meta}>
        {index && <span className={styles.index}>{index}</span>}
        <span className="kicker">{kicker}</span>
      </p>
      <h2 id={id} className={`display ${styles.title}`}>
        <Marked text={title} />
      </h2>
      {lede && <p className={`lede ${styles.lede}`}>{lede}</p>}
    </header>
  );
}
