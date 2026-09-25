"use client";

import { useMemo, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import styles from "./hardware.module.css";

/**
 * Local models, measured in the one number people know about their PC:
 * memory. Each model is a bar against the memory you pick; what does not fit
 * spills past the edge instead of being hidden.
 */
export function Hardware({ copy }: { copy: Dict["hardware"] }) {
  const [ram, setRam] = useState(16);
  const models = copy.picker.models;
  const options = copy.picker.options;
  const best = useMemo(() => [...models].reverse().find((model) => model.ram <= ram) ?? null, [models, ram]);

  return (
    <Reveal as="section" className={styles.section} labelledBy="hardware-title" id="hardware">
      <div className={`shell ${styles.grid}`}>
        <div className={styles.copy}>
          <ChapterHead id="hardware-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
          <ul className={styles.notes}>
            {copy.notes.map((note, index) => (
              <li key={note.title} data-reveal>
                <span className={styles.noteIcon} aria-hidden>
                  <NoteGlyph index={index} />
                </span>
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`card ${styles.picker}`} data-reveal>
          <p className={styles.pickerLabel} id="ram-label">
            {copy.picker.label}
          </p>
          <div className={styles.segments} role="radiogroup" aria-labelledby="ram-label">
            <span
              className={styles.thumb}
              aria-hidden
              style={{ "--index": options.indexOf(ram), "--count": options.length } as React.CSSProperties}
            />
            {options.map((option) => (
              <button key={option} type="button" role="radio" aria-checked={ram === option} className={styles.segment} onClick={() => setRam(option)}>
                {option} {copy.picker.unit}
              </button>
            ))}
          </div>

          <ul className={styles.models}>
            {models.map((model) => {
              const fits = model.ram <= ram;
              const chosen = best?.name === model.name;
              const share = Math.min(1, model.ram / ram);
              const missing = fits ? 0 : 1 - ram / model.ram;
              return (
                <li key={model.name} className={styles.model} data-fits={fits} data-chosen={chosen}>
                  <div className={styles.modelHead}>
                    <span className={styles.modelName}>
                      {model.name}
                      {model.beta && <em>Beta</em>}
                    </span>
                    <span className={styles.modelNote}>{model.note}</span>
                    {chosen && <span className={styles.chosen}>{copy.picker.recommended}</span>}
                  </div>
                  <div className={styles.track} aria-hidden>
                    <span className={styles.fill} style={{ "--share": fits ? share : 1 } as React.CSSProperties} />
                    {missing > 0 && <span className={styles.over} style={{ "--missing": missing } as React.CSSProperties} />}
                  </div>
                  <p className={styles.modelFit}>
                    {fits ? copy.picker.fits : copy.picker.tight} · {model.ram} {copy.picker.unit}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className={styles.hint}>{copy.picker.hint}</p>
        </div>
      </div>
    </Reveal>
  );
}

function NoteGlyph({ index }: { index: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (index === 0)
    return (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <rect x="3" y="3" width="12" height="12" rx="2.5" {...common} />
        <path d="M6.5 9h5M9 6.5v5" {...common} />
      </svg>
    );
  if (index === 1)
    return (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <circle cx="9" cy="9" r="6" {...common} />
        <path d="M3 9h12M9 3c1.8 1.7 2.6 3.7 2.6 6S10.8 13.3 9 15M9 3C7.2 4.7 6.4 6.7 6.4 9s.8 4.3 2.6 6" {...common} />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M3 13.5a6 6 0 1 1 12 0" {...common} />
      <path d="M9 13.5 11.8 8.6" {...common} />
    </svg>
  );
}
