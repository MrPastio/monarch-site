"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import { MonarchMark } from "@/components/brand/monarch-mark";
import styles from "./guard.module.css";

const EVENTS = [
  { time: "02:14", text: "Автозагрузка: без изменений", tone: "ok" },
  { time: "02:16", text: "Новый файл в «Загрузках» проверен", tone: "ok" },
  { time: "02:21", text: "Сетевое подключение: известный процесс", tone: "ok" },
  { time: "02:30", text: "Попытка изменить задачу планировщика", tone: "warn" },
] as const;

export function Guard({ copy }: { copy: Dict["guard"] }) {
  const artRef = useRef<HTMLDivElement>(null);
  const [closed, setClosed] = useState(false);
  const [mode, setMode] = useState("guard");
  const modeIndex = copy.modes.findIndex((item) => item.id === mode);
  const current = copy.modes[modeIndex]!;

  // Scroll closes the Monarch window; the sentinel stays. Scrolling back
  // reopens it — the state follows the reader both ways.
  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    if (prefersReducedMotion()) {
      setClosed(true);
      return;
    }
    const { ScrollTrigger } = getGsap();
    const trigger = ScrollTrigger.create({
      trigger: art,
      start: "top 45%",
      onEnter: () => setClosed(true),
      onLeaveBack: () => setClosed(false),
    });
    return () => trigger.kill();
  }, []);

  return (
    <Reveal as="section" className={styles.section} labelledBy="guard-title">
      <div className="shell">
        <ChapterHead id="guard-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
      </div>

      <div ref={artRef} className={`shell ${styles.art}`} data-closed={closed} aria-hidden>
        <div className={styles.appCol}>
        <div className={styles.appWindow}>
          <div className={styles.titlebar}>
            <MonarchMark size={14} />
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
          <p className={styles.closedLabel}>{copy.labels.closed}</p>
        </div>

        <div className={styles.link}>
          <span />
        </div>

        <div className={styles.sentinel}>
          <div className={styles.sentinelHead}>
            <svg width="28" height="32" viewBox="0 0 28 32">
              <path d="M14 2 L26 6.5 V15 C26 23 20.5 28 14 30.5 C7.5 28 2 23 2 15 V6.5 Z" fill="none" stroke="#ffc862" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 16 l3.5 3.5 L19.5 12" fill="none" stroke="#ffc862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className={styles.sentinelName}>{copy.labels.sentinel}</p>
              <p className={styles.sentinelState}>
                <i />
                {copy.labels.running}
              </p>
            </div>
          </div>
          <p className={styles.eventsLabel}>{copy.labels.events}</p>
          <ul className={styles.events}>
            {EVENTS.map((event, index) => (
              <li key={event.time} data-tone={event.tone} style={{ "--i": index } as React.CSSProperties}>
                <time>{event.time}</time>
                {event.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`shell ${styles.controls}`}>
        <div className={`glass ${styles.modes}`} data-reveal>
          <p className={styles.modesLabel} id="modes-label">
            {copy.modesLabel}
          </p>
          <div className={styles.dialRow}>
            <svg className={styles.dial} viewBox="0 0 140 140" aria-hidden>
              <circle cx="70" cy="70" r="62" fill="#0e1013" stroke="rgba(255,255,255,.1)" />
              {copy.modes.map((item, index) => {
                const angle = -135 + index * 90;
                const rad = (angle * Math.PI) / 180;
                return (
                  <circle
                    key={item.id}
                    cx={70 + Math.sin(rad) * 50}
                    cy={70 - Math.cos(rad) * 50}
                    r="4"
                    fill={index === modeIndex ? "#ffb52b" : "rgba(255,255,255,.2)"}
                  />
                );
              })}
              <g className={styles.needle} style={{ transform: `rotate(${-135 + modeIndex * 90}deg)` }}>
                <circle cx="70" cy="70" r="30" fill="#1b1e23" stroke="rgba(255,255,255,.14)" />
                <rect x="67" y="36" width="6" height="26" rx="3" fill="#ffb52b" />
              </g>
            </svg>
            <div className={styles.modeButtons} role="radiogroup" aria-labelledby="modes-label">
              {copy.modes.map((item) => (
                <button key={item.id} type="button" role="radio" aria-checked={item.id === mode} onClick={() => setMode(item.id)} className={styles.modeButton}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <p key={current.id} className={styles.modeText}>
            {current.text}
          </p>
        </div>

        <div className={styles.side}>
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
      </div>
    </Reveal>
  );
}
