"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import { crestCrown, crestShield, crestTrunk } from "@/components/brand/crest-paths";
import styles from "./safe.module.css";

const BOLTS = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
const BLOCKS = Array.from({ length: 24 }, (_, i) => i);

export function Safe({ copy, agent }: { copy: Dict["safe"]; agent: string }) {
  const artRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);

  // The vault locks once, when it comes into view: the file is sealed into
  // blocks, bolts slide home, the wheel turns a quarter. Then it stays still.
  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    if (prefersReducedMotion()) return; // CSS shows the locked state
    const { ScrollTrigger } = getGsap();
    const trigger = ScrollTrigger.create({
      trigger: art,
      start: "top 65%",
      once: true,
      onEnter: () => setLocked(true),
    });
    return () => trigger.kill();
  }, []);

  return (
    <Reveal as="section" className={styles.section} labelledBy="safe-title">
      <div className={`shell ${styles.grid}`}>
        <div className={styles.copy}>
          <ChapterHead id="safe-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
          <dl className={styles.points}>
            {copy.points.map((point) => (
              <div key={point.value} className={styles.point} data-reveal>
                <dt>{point.value}</dt>
                <dd>{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={artRef} className={styles.art} data-locked={locked} aria-hidden>
          <svg viewBox="0 0 640 620" className={styles.svg}>
            <defs>
              <radialGradient id="sf-door" cx=".42" cy=".36" r=".75">
                <stop offset="0" stopColor="#4a4f57" />
                <stop offset=".55" stopColor="#23262b" />
                <stop offset="1" stopColor="#111316" />
              </radialGradient>
              <linearGradient id="sf-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6b7078" />
                <stop offset=".5" stopColor="#23262b" />
                <stop offset="1" stopColor="#4a4f57" />
              </linearGradient>
              <linearGradient id="sf-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffe29a" />
                <stop offset=".5" stopColor="#e1ad33" />
                <stop offset="1" stopColor="#9c6c16" />
              </linearGradient>
              <radialGradient id="sf-light" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="rgba(255,190,90,.16)" />
                <stop offset="1" stopColor="rgba(255,190,90,0)" />
              </radialGradient>
            </defs>

            <ellipse cx="380" cy="300" rx="290" ry="280" fill="url(#sf-light)" />

            {/* Agent boundary: a wall the agent cannot pass */}
            <circle cx="380" cy="300" r="236" className={styles.wall} />
            <g className={styles.agent}>
              <rect x="-44" y="-17" width="88" height="34" rx="17" className={styles.agentChip} />
              <path d="M-32 -7 l10 16 l3 -7 l7 -3 Z" fill="#f7f5ef" />
              <text x="-12" y="5" className={styles.agentText}>
                {agent}
              </text>
            </g>
            <g className={styles.blocked}>
              <rect x="-62" y="-15" width="124" height="30" rx="15" />
              <text y="5">{copy.labels.blocked}</text>
            </g>

            {/* Vault body */}
            <circle cx="380" cy="300" r="196" fill="#0b0c0e" stroke="rgba(255,255,255,.08)" />
            <circle cx="380" cy="300" r="184" fill="url(#sf-ring)" />
            <circle cx="380" cy="300" r="160" fill="url(#sf-door)" stroke="rgba(255,255,255,.12)" />
            {BOLTS.map((angle, index) => (
              <g key={index} transform={`translate(380 300) rotate(${(angle * 180) / Math.PI})`}>
                <rect x="150" y="-9" width="34" height="18" rx="4" className={styles.bolt} />
              </g>
            ))}
            <circle cx="380" cy="300" r="118" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2" />
            <circle cx="380" cy="300" r="104" fill="none" stroke="rgba(0,0,0,.5)" strokeWidth="6" />

            {/* Wheel */}
            <g className={styles.wheel}>
              {[0, 60, 120].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <rect x="-96" y="-7" width="192" height="14" rx="7" fill="url(#sf-gold)" />
                  <circle cx="-96" cy="0" r="13" fill="url(#sf-gold)" />
                  <circle cx="96" cy="0" r="13" fill="url(#sf-gold)" />
                </g>
              ))}
            </g>
            <g transform="translate(380 300)">
              <circle r="46" fill="#15171b" stroke="url(#sf-gold)" strokeWidth="4" />
              <g transform="translate(-19 -28) scale(0.0685)">
                <path d={crestCrown} fill="#e1ad33" fillRule="evenodd" />
                <path d={crestShield} fill="#f3efe6" fillRule="evenodd" />
                <path d={crestTrunk} fill="#f3efe6" fillRule="evenodd" />
              </g>
            </g>

            {/* The file, sealed into blocks as it enters */}
            <g className={styles.file}>
              <rect x="0" y="0" width="120" height="150" rx="12" fill="#f3efe6" />
              <path d="M88 0 v26 a6 6 0 0 0 6 6 h26" fill="#d9d2c3" />
              <rect x="16" y="52" width="72" height="8" rx="4" fill="#c9c1b0" />
              <rect x="16" y="70" width="88" height="8" rx="4" fill="#c9c1b0" />
              <rect x="16" y="88" width="60" height="8" rx="4" fill="#c9c1b0" />
              <text x="16" y="132" className={styles.fileName}>
                {copy.labels.file}
              </text>
            </g>
            <g className={styles.blocks}>
              {BLOCKS.map((index) => (
                <rect
                  key={index}
                  x={(index % 4) * 30}
                  y={Math.floor(index / 4) * 26}
                  width="24"
                  height="20"
                  rx="4"
                  className={styles.block}
                  style={{ "--i": index } as React.CSSProperties}
                />
              ))}
            </g>

            {/* PIN */}
            <g transform="translate(290 548)" className={styles.pin}>
              <rect x="-10" y="-22" width="200" height="44" rx="22" fill="#121416" stroke="rgba(255,255,255,.12)" />
              <text x="14" y="5" className={styles.pinLabel}>
                {copy.labels.pin}
              </text>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle key={i} cx={62 + i * 20} cy="0" r="5" className={styles.pinDot} style={{ "--i": i } as React.CSSProperties} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="shell">
        <div className={styles.footer} data-reveal>
          <p className={styles.wallText}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <rect x="3.5" y="8.5" width="13" height="9" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {copy.wall}
          </p>
          <p className={styles.limit}>{copy.limit}</p>
        </div>
      </div>
    </Reveal>
  );
}
