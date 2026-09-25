"use client";

import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { MonarchMark } from "@/components/brand/monarch-mark";
import styles from "./guard.module.css";

type Copy = Dict["guard"];

/**
 * Monarch Security. Two honest demonstrations:
 * - close the window: it folds into its taskbar button, while the sentinel
 *   in the tray keeps writing events;
 * - pick a mode: the risk threshold moves on the scale (Guard 70%, Strict
 *   50%, as in 0.2.5), and each sample action shows what happens to it.
 */
export function Guard({ copy, events, indexed = true }: { copy: Copy; events: Dict["ui"]["events"]; indexed?: boolean }) {
  const [closed, setClosed] = useState(false);
  const [mode, setMode] = useState("guard");
  const current = copy.modes.find((item) => item.id === mode)!;
  const threshold = current.threshold;
  const log = closed ? [...copy.desktop.later].reverse().concat(events.slice().reverse()) : events.slice().reverse();

  const outcome = (score: number) => {
    if (mode === "off") return "passed";
    if (mode === "observe") return "logged";
    return score >= threshold ? "stopped" : "passed";
  };

  return (
    <Reveal as="section" className={styles.section} labelledBy="guard-title">
      <div className={`shell ${styles.grid}`}>
        <div className={styles.copy}>
          <ChapterHead id="guard-title" index={indexed ? copy.index : undefined} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
          <ul className={styles.facts}>
            {copy.facts.map((fact) => (
              <li key={fact} data-reveal>
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                  <path d="M3.5 9.4 7.2 13l7.3-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {fact}
              </li>
            ))}
          </ul>
          <p className={styles.honest} data-reveal>
            {copy.honest}
          </p>
        </div>

        <div className={styles.demo} data-reveal>
          <div className={styles.desktop} data-closed={closed} aria-hidden>
            <div className={styles.appWindow}>
              <div className={styles.titlebar}>
                <MonarchMark size={13} />
                <span>{copy.labels.app}</span>
                <i />
                <i />
                <i />
              </div>
              <div className={styles.appBody}>
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className={styles.toast}>
              <ShieldGlyph />
              {copy.desktop.toast}
            </div>
            <div className={styles.taskbar}>
              <span className={styles.start} />
              <span className={styles.taskApp}>
                <MonarchMark size={14} />
              </span>
              <span className={styles.tray}>
                <span className={styles.trayShield}>
                  <ShieldGlyph />
                </span>
                02:43
              </span>
            </div>
          </div>

          <div className={styles.log}>
            <div className={styles.logHead}>
              <ShieldGlyph />
              <div>
                <p className={styles.sentinelName}>{copy.labels.sentinel}</p>
                <p className={styles.sentinelState}>
                  <i />
                  {copy.labels.running}
                </p>
              </div>
            </div>
            <p className={styles.eventsLabel}>{copy.labels.events}</p>
            <ul className={styles.events} aria-live="polite">
              {log.slice(0, 5).map((event) => (
                <li key={event.time} data-tone={event.tone}>
                  <time>{event.time}</time>
                  {event.text}
                </li>
              ))}
            </ul>
          </div>

          <button type="button" className={`btn ${closed ? "btn-glass" : "btn-primary"} ${styles.toggle}`} onClick={() => setClosed((value) => !value)} aria-pressed={closed}>
            {closed ? copy.desktop.reopen : copy.desktop.close}
          </button>
        </div>
      </div>

      <div className="shell">
        <div className={`glass ${styles.modes}`} data-reveal>
          <div className={styles.modesTop}>
            <p className={styles.modesLabel} id="modes-label">
              {copy.modesLabel}
            </p>
            <div className={styles.segments} role="radiogroup" aria-labelledby="modes-label" style={{ "--index": copy.modes.indexOf(current), "--count": copy.modes.length } as React.CSSProperties}>
              <span className={styles.thumb} aria-hidden />
              {copy.modes.map((item) => (
                <button key={item.id} type="button" role="radio" aria-checked={item.id === mode} onClick={() => setMode(item.id)} className={styles.segment}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p key={current.id} className={styles.modeText}>
            {current.text}
          </p>

          <div className={styles.scale} data-mode={mode} style={{ "--th": threshold } as React.CSSProperties}>
            <div className={styles.bar}>
              <span className={styles.zone} />
              <span className={styles.marker}>
                <b>{threshold}%</b>
              </span>
              {copy.risk.samples.map((sample) => (
                <span
                  key={sample.text}
                  className={styles.sampleDot}
                  data-outcome={outcome(sample.score)}
                  style={{ "--x": sample.score } as React.CSSProperties}
                />
              ))}
            </div>
            <div className={styles.axis} aria-hidden>
              <span>0%</span>
              <span>{copy.risk.label}</span>
              <span>100%</span>
            </div>
            <ul className={styles.samples}>
              {copy.risk.samples.map((sample) => {
                const result = outcome(sample.score);
                return (
                  <li key={sample.text} data-outcome={result}>
                    <span className={styles.sampleScore}>{sample.score}%</span>
                    <span className={styles.sampleText}>{sample.text}</span>
                    <span className={styles.sampleResult}>
                      {result === "stopped" ? copy.risk.stopped : result === "logged" ? copy.risk.logged : copy.risk.passed}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className={styles.example}>
              {mode === "off" ? `${copy.risk.boundary} · ` : ""}
              {copy.risk.example}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function ShieldGlyph() {
  return (
    <svg width="18" height="20" viewBox="0 0 28 32" aria-hidden>
      <path d="M14 2 L26 6.5 V15 C26 23 20.5 28 14 30.5 C7.5 28 2 23 2 15 V6.5 Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M9 16 l3.5 3.5 L19.5 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
