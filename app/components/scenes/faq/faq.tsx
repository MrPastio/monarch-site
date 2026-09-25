"use client";

import { useId, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { Reveal } from "@/components/motion/reveal";
import styles from "./faq.module.css";

/**
 * Questions unfold out of themselves: the answer's row grows from 0fr to
 * 1fr, so opening another question mid-way simply reverses the first one.
 */
export function Faq({ copy }: { copy: Dict["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <Reveal as="section" className={styles.section} labelledBy="faq-title">
      <div className={`shell ${styles.grid}`}>
        <h2 id="faq-title" className={`display ${styles.title}`} data-reveal>
          {copy.title}
        </h2>
        <div className={styles.list}>
          {copy.items.map((item, index) => {
            const expanded = open === index;
            const buttonId = `${base}-q${index}`;
            const panelId = `${base}-a${index}`;
            return (
              <div key={item.q} className={styles.item} data-open={expanded} data-reveal>
                <h3 className={styles.question}>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    {item.q}
                    <span className={styles.icon} aria-hidden />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel} inert={!expanded}>
                  <div className={styles.clip}>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
