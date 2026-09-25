"use client";

import { useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { Marked, useLit } from "@/components/motion/marked";
import styles from "./access-modes.module.css";

type Copy = Dict["access"];
type Verdict = "allow" | "confirm" | "deny";
const ORDER: Verdict[] = ["allow", "confirm", "deny"];

/**
 * Autonomy modes as the permission gate decides them (0.2.5
 * permissionRuleFor). Choosing a mode rolls each verdict to its new value —
 * the chip turns like a drum in the direction of the change, instead of
 * blinking to a new colour.
 */
export function AccessModes({ copy, lanes }: { copy: Copy; lanes: Dict["journey"]["lanes"] }) {
  const [mode, setMode] = useState(1);
  const { ref, unlit } = useLit<HTMLDivElement>();
  const group = useRef<HTMLDivElement>(null);

  const onKey = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (mode + step + copy.modes.length) % copy.modes.length;
    setMode(next);
    group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };

  return (
    <div ref={ref} className={styles.root} data-unlit={unlit}>
      <header className={styles.head}>
        <p className="kicker">{copy.kicker}</p>
        <h3 className={`display ${styles.title}`}>
          <Marked text={copy.title} />
        </h3>
        <p className={styles.lede}>{copy.lede}</p>
      </header>

      <div className={`card ${styles.board}`}>
        <div
          ref={group}
          className={styles.modes}
          role="radiogroup"
          aria-label={copy.modesLabel}
          onKeyDown={onKey}
          style={{ "--mode": mode, "--count": copy.modes.length } as React.CSSProperties}
        >
          <span className={styles.thumb} aria-hidden />
          {copy.modes.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={index === mode}
              tabIndex={index === mode ? 0 : -1}
              className={styles.mode}
              onClick={() => setMode(index)}
            >
              <span className={styles.modeName}>{item.name}</span>
              <span className={styles.modeText}>{item.text}</span>
            </button>
          ))}
        </div>

        <div className={styles.matrix}>
          <p className={styles.matrixLabel}>{copy.actionsLabel}</p>
          <ul className={styles.actions} aria-live="polite">
            {copy.actions.map((action, row) => {
              const verdict = action.verdicts[mode] as Verdict;
              const index = ORDER.indexOf(verdict);
              return (
                <li key={action.id} className={styles.action} style={{ "--row": row } as React.CSSProperties}>
                  <span className={styles.actionText}>{action.text}</span>
                  <span className={styles.chip} data-verdict={verdict} style={{ "--v": index } as React.CSSProperties}>
                    <span className={styles.roll} aria-hidden>
                      {ORDER.map((name) => (
                        <span key={name} className={styles.rollItem} data-name={name}>
                          <i />
                          {lanes[name]}
                        </span>
                      ))}
                    </span>
                    <span className="sr-only">{lanes[verdict]}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={styles.note}>{copy.note}</p>
        </div>
      </div>
    </div>
  );
}
