import styles from "./night-band.module.css";

/**
 * The night chapter: a dark sheet that rises over the paper. Everything
 * inside reads the same tokens, redefined by `.night`.
 */
export function NightBand({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className={`night ${styles.band}`} id={id}>
      {children}
    </div>
  );
}
