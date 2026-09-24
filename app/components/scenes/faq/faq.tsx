import type { Dict } from "@/content/dictionary";
import { Reveal } from "@/components/motion/reveal";
import styles from "./faq.module.css";

export function Faq({ copy }: { copy: Dict["faq"] }) {
  return (
    <Reveal as="section" className={styles.section} labelledBy="faq-title">
      <div className={`shell ${styles.grid}`}>
        <h2 id="faq-title" className={`display ${styles.title}`} data-reveal>
          {copy.title}
        </h2>
        <div className={styles.list}>
          {copy.items.map((item) => (
            <details key={item.q} className={styles.item} name="faq" data-reveal>
              <summary>
                {item.q}
                <span className={styles.icon} aria-hidden />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
