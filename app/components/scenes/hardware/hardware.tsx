"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { Motherboard } from "@/components/illustration/motherboard";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import styles from "./hardware.module.css";

const ORDER = ["board", "traces", "chipset", "ssd", "caps", "cpu", "ram", "net"];

export function Hardware({ copy }: { copy: Dict["hardware"] }) {
  const [ram, setRam] = useState(16);
  const stageRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  const models = copy.picker.models;
  const best = useMemo(() => [...models].reverse().find((model) => model.ram <= ram) ?? null, [models, ram]);
  const fill = best ? Math.min(0.9, (best.ram / ram) * 0.78) : 0.08;
  const sticks = ram <= 16 ? 2 : 4;

  // The board assembles once: base first, then parts dropped onto it in the
  // order a builder would place them. Then the traces are drawn.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (prefersReducedMotion()) return; // CSS shows the traces drawn
    const { gsap, ScrollTrigger } = getGsap();
    const parts = ORDER.map((name) => stage.querySelector(`[data-part="${name}"]`)).filter(Boolean);
    const context = gsap.context(() => {
      gsap.set(parts, { autoAlpha: 0, y: -70 });
      ScrollTrigger.create({
        trigger: stage,
        start: "top 72%",
        once: true,
        onEnter: () => {
          gsap
            .timeline({ onComplete: () => setDrawn(true) })
            .to(parts[0]!, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" })
            .to(parts.slice(1), { autoAlpha: 1, y: 0, duration: 0.75, ease: "back.out(1.3)", stagger: 0.09 }, "-=0.45");
          window.setTimeout(() => setDrawn(true), 900);
        },
      });
    }, stage);
    return () => context.revert();
  }, []);

  useEffect(() => {
    stageRef.current?.querySelector('[data-part="traces"]')?.setAttribute("data-drawn", String(drawn));
  }, [drawn]);

  return (
    <Reveal as="section" className={styles.section} labelledBy="hardware-title">
      <div className="shell">
        <ChapterHead id="hardware-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
      </div>

      <div ref={stageRef} className={`shell-wide ${styles.stage}`}>
        <Motherboard labels={copy.labels} sticks={sticks} fill={fill} modelName={best?.name ?? "—"} />
      </div>

      <div className={`shell ${styles.lower}`}>
        <div className={`glass ${styles.picker}`} data-reveal>
          <p className={styles.pickerLabel} id="ram-label">
            {copy.picker.label}
          </p>
          <div className={styles.segments} role="radiogroup" aria-labelledby="ram-label">
            {copy.picker.options.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={ram === option}
                className={styles.segment}
                onClick={() => setRam(option)}
              >
                {option} {copy.picker.unit}
              </button>
            ))}
            <span
              className={styles.thumb}
              aria-hidden
              style={{ "--index": copy.picker.options.indexOf(ram), "--count": copy.picker.options.length } as React.CSSProperties}
            />
          </div>
          <ul className={styles.models}>
            {models.map((model) => {
              const fits = model.ram <= ram;
              const chosen = best?.name === model.name;
              return (
                <li key={model.name} className={styles.model} data-fits={fits} data-chosen={chosen}>
                  <span className={styles.modelDot} aria-hidden />
                  <span className={styles.modelName}>
                    {model.name}
                    {model.beta && <em>Beta</em>}
                  </span>
                  <span className={styles.modelNote}>{model.note}</span>
                  <span className={styles.modelFit}>
                    {fits ? copy.picker.fits : copy.picker.tight} · {model.ram} {copy.picker.unit}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={styles.hint}>{copy.picker.hint}</p>
        </div>

        <ul className={styles.notes}>
          {copy.notes.map((note) => (
            <li key={note.title} data-reveal>
              <h3>{note.title}</h3>
              <p>{note.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
