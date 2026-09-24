import styles from "./chapter.module.css";

/** Shared chapter heading: index, kicker, title, lede. */
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
  return (
    <header className={styles.head} data-align={align} data-reveal>
      <p className={styles.meta}>
        {index && <span className={styles.index}>{index}</span>}
        <span className="kicker">{kicker}</span>
      </p>
      <h2 id={id} className={`display ${styles.title}`}>
        {title}
      </h2>
      {lede && <p className={`lede ${styles.lede}`}>{lede}</p>}
    </header>
  );
}
