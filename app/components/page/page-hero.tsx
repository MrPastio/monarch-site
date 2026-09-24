import styles from "./page-hero.module.css";

/** Opening of an inner page: kicker, a large title and one line of context. */
export function PageHero({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={styles.hero}>
      <div className={`shell ${styles.inner}`} data-has-art={Boolean(children)}>
        <div className={styles.copy}>
          <p className="kicker">{kicker}</p>
          <h1 className={`display ${styles.title}`}>{title}</h1>
          <p className={`lede ${styles.lede}`}>{lede}</p>
        </div>
        {children && <div className={styles.art}>{children}</div>}
      </div>
    </section>
  );
}
