"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { MonarchMark } from "@/components/brand/monarch-mark";
import { asset } from "@/lib/asset";
import styles from "./max.module.css";

const PROVIDERS = [
  { id: "groq", name: "Groq" },
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "gemini", name: "Gemini" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "mistral", name: "Mistral" },
  { id: "xai", name: "xAI" },
  { id: "together", name: "Together" },
  { id: "fireworks", name: "Fireworks" },
  { id: "cerebras", name: "Cerebras" },
  { id: "nvidia", name: "NVIDIA" },
] as const;

export function Max({ copy }: { copy: Dict["max"] }) {
  const [checks, setChecks] = useState<boolean[]>(() => copy.consent.map(() => false));
  const [provider, setProvider] = useState<string>("groq");
  const ready = checks.every(Boolean);
  const selected = PROVIDERS.findIndex((item) => item.id === provider);

  return (
    <Reveal as="section" className={styles.section} labelledBy="max-title">
      <div className="shell">
        <ChapterHead id="max-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
      </div>

      <div className={`shell-wide ${styles.flow}`} data-ready={ready}>
        <div className={styles.machine} data-reveal>
          <div className={styles.pcWrap}>
          <svg viewBox="0 0 120 90" className={styles.pc} aria-hidden>
            <rect x="8" y="6" width="104" height="64" rx="8" fill="#15171b" stroke="rgba(255,255,255,.18)" />
            <rect x="14" y="12" width="92" height="52" rx="4" fill="#0b0c0e" />
            <path d="M48 72 h24 l4 10 h-32 Z" fill="#23262b" />
            <rect x="36" y="82" width="48" height="4" rx="2" fill="#2d3138" />
          </svg>
          <MonarchMark size={26} className={styles.pcMark} />
          </div>
          <p className={styles.nodeTitle}>{copy.local}</p>
        </div>

        <div className={styles.wire} aria-hidden>
          <span className={styles.wireFill} />
        </div>

        <div className={`glass ${styles.gate}`} data-reveal>
          <p className={styles.gateTitle}>{copy.consentTitle}</p>
          <ul>
            {copy.consent.map((item, index) => (
              <li key={item}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={checks[index]}
                    onChange={(event) =>
                      setChecks((current) => current.map((value, i) => (i === index ? event.target.checked : value)))
                    }
                  />
                  <span className={styles.box} aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
                    </svg>
                  </span>
                  {item}
                </label>
              </li>
            ))}
          </ul>
          <p className={styles.status} aria-live="polite">
            {ready ? copy.ready : copy.waiting}
          </p>
        </div>

        <div className={styles.wire} aria-hidden>
          <span className={styles.wireFill} />
        </div>

        <div className={styles.cloud} data-reveal>
          <p className={styles.cloudTitle}>{copy.providersLabel}</p>
          <div className={styles.providers} role="radiogroup" aria-label={copy.providersLabel}>
            {PROVIDERS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === provider}
                className={styles.provider}
                data-live={ready && index === selected}
                onClick={() => setProvider(item.id)}
              >
                <Image src={asset(`/providers/${item.id}.svg`)} alt="" width={22} height={22} unoptimized />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shell">
        <ul className={styles.points}>
          {copy.points.map((point) => (
            <li key={point} data-reveal>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
