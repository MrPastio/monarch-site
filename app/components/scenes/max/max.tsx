"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { MonarchTile } from "@/components/brand/monarch-mark";
import { asset } from "@/lib/asset";
import styles from "./max.module.css";
import { PixelGlyph } from "@/components/pixel/pixel";

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

/**
 * MAX, in the shape of the consent sheet the owner approved for the app:
 * where the data goes (bridge) on top, what leaves and what stays below, then
 * the three-part consent. The link is drawn only once every part is checked.
 */
export function Max({ copy }: { copy: Dict["max"] }) {
  const [checks, setChecks] = useState<boolean[]>(() => copy.consent.map(() => false));
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]["id"]>("groq");
  const ready = checks.every(Boolean);
  const chosen = PROVIDERS.find((item) => item.id === provider)!;

  return (
    <Reveal as="section" className={styles.section} labelledBy="max-title">
      <div className="shell">
        <ChapterHead id="max-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} align="center" />

        <div className={`card ${styles.sheet}`} data-ready={ready} data-reveal>
          <div className={styles.bridge} aria-hidden>
            <div className={styles.node}>
              <span className={styles.nodeMark}>
                <MonarchTile size={30} />
              </span>
              <strong>{copy.local}</strong>
              <small>Monarch</small>
            </div>
            <div className={styles.link}>
              <svg viewBox="0 0 100 12" preserveAspectRatio="none">
                <path className={styles.track} d="M1 6H99" />
                <path className={styles.flow} d="M1 6H97" pathLength={1} />
                <path className={styles.arrow} d="M93 2.5L98.5 6L93 9.5" />
              </svg>
            </div>
            <div className={styles.node}>
              <span className={styles.nodeMark} key={chosen.id}>
                <Image src={asset(`/providers/${chosen.id}.svg`)} alt="" width={24} height={24} unoptimized />
              </span>
              <strong>{chosen.name}</strong>
              <small>{copy.via}</small>
            </div>
          </div>

          <div className={styles.providers} role="radiogroup" aria-label={copy.providersLabel}>
            <p className={styles.providersLabel}>{copy.providersLabel}</p>
            <div className={styles.providerGrid}>
              {PROVIDERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === provider}
                  className={styles.provider}
                  onClick={() => setProvider(item.id)}
                >
                  <Image src={asset(`/providers/${item.id}.svg`)} alt="" width={18} height={18} unoptimized />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.scope}>
            <section data-kind="goes">
              <h3>
                <i />
                {copy.goesTitle}
              </h3>
              <ul>
                {copy.goes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section data-kind="stays">
              <h3>
                <i />
                {copy.staysTitle}
              </h3>
              <ul>
                {copy.stays.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <fieldset className={styles.consent}>
            <legend>{copy.consentTitle}</legend>
            {copy.consent.map((item, index) => (
              <label key={item} className={styles.check}>
                <input
                  type="checkbox"
                  checked={checks[index]}
                  onChange={(event) => setChecks((current) => current.map((value, i) => (i === index ? event.target.checked : value)))}
                />
                <span className={styles.box} aria-hidden>
                  <PixelGlyph name="check" size={12} animate />
                </span>
                {item}
              </label>
            ))}
          </fieldset>

          <p className={styles.status} aria-live="polite" data-ready={ready}>
            <span className={styles.statusDot} />
            {ready ? copy.ready : copy.waiting}
          </p>
        </div>

        <ul className={styles.points}>
          {copy.points.map((point) => (
            <li key={point} data-reveal>
              <PixelGlyph name="check" size={14} />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
