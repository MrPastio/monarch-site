"use client";

import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { useLit } from "@/components/motion/marked";
import { asset } from "@/lib/asset";
import styles from "./safe.module.css";

const CELLS = Array.from({ length: 40 }, (_, index) => index);
const HEX = "3f a9 0c e1 7b 52 d8 16 9e 44 c0 2a f7 6d 81 b3 05 ea 39 7c d2 60 1f 8b a4 57 e9 0b 36 cd 72 98 14 fb 4e a0 6b 2d 93 c8".split(" ");

/**
 * Monarch Safe. The scene locks once when seen: the file slides into the
 * vault and turns into cipher blocks, the PIN fills, the shackle drops, and
 * Oscar walks up to the wall and is stopped there. "Lock again" replays it.
 */
export function Safe({ copy, agent, indexed = true }: { copy: Dict["safe"]; agent: string; indexed?: boolean }) {
  const [take, setTake] = useState(0);

  return (
    <Reveal as="section" className={styles.section} labelledBy="safe-title">
      <div className={`shell ${styles.grid}`}>
        <div className={styles.copy}>
          <ChapterHead id="safe-title" index={indexed ? copy.index : undefined} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
          <dl className={styles.points}>
            {copy.points.map((point) => (
              <div key={point.value} className={styles.point} data-reveal>
                <dt>{point.value}</dt>
                <dd>{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.side}>
          <Vault key={take} copy={copy} agent={agent} />
          <button type="button" className={`btn btn-glass ${styles.replay}`} onClick={() => setTake((value) => value + 1)}>
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
              <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {copy.labels.replay}
          </button>
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

function Vault({ copy, agent }: { copy: Dict["safe"]; agent: string }) {
  const { ref, unlit } = useLit<HTMLDivElement>();
  return (
    <div ref={ref} className={styles.scene} data-unlit={unlit} aria-hidden>
      <div className={styles.vault}>
        <header className={styles.vaultHead}>
          <span className={styles.lock}>
            <svg width="22" height="24" viewBox="0 0 22 24">
              <path className={styles.shackle} d="M6 11V7.5a5 5 0 0 1 10 0V11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="3" y="11" width="16" height="11" rx="3" fill="currentColor" />
              <circle cx="11" cy="16.2" r="1.7" fill="#12110f" />
            </svg>
          </span>
          <span className={styles.vaultName}>{copy.labels.vault}</span>
          <span className={styles.status}>
            <span data-state="open">{copy.labels.open}</span>
            <span data-state="locked">{copy.labels.locked}</span>
          </span>
        </header>

        <div className={styles.slot}>
          <div className={styles.file}>
            <svg width="26" height="32" viewBox="0 0 26 32">
              <path d="M3 1h13l8 8v20a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z" fill="#f6f2ea" />
              <path d="M16 1v6a2 2 0 0 0 2 2h6" fill="#d9d2c3" />
              <rect x="5" y="15" width="12" height="2" rx="1" fill="#c9c1b0" />
              <rect x="5" y="20" width="15" height="2" rx="1" fill="#c9c1b0" />
            </svg>
            <span>{copy.labels.file}</span>
          </div>
          <div className={styles.cipher}>
            {CELLS.map((index) => (
              <span key={index} style={{ "--i": index } as React.CSSProperties}>
                {HEX[index]}
              </span>
            ))}
          </div>
        </div>

        <p className={styles.sealed}>{copy.labels.sealed}</p>

        <div className={styles.pin}>
          <span>{copy.labels.pin}</span>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <i key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </div>
      </div>

      <span className={styles.wall} />
      <div className={styles.agent}>
        <span className={styles.agentFace} style={{ backgroundImage: `url("${asset("/mascot/oscar-error.webp")}")` }} />
        <span>{agent}</span>
      </div>
      <p className={styles.blocked}>{copy.labels.blocked}</p>
    </div>
  );
}
