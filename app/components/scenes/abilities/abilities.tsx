"use client";

import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { useLit } from "@/components/motion/marked";
import { MonarchMark } from "@/components/brand/monarch-mark";
import { asset } from "@/lib/asset";
import styles from "./abilities.module.css";

type Copy = Dict["abilities"];
type Item = Copy["items"][number];
type Vignettes = Copy["vignettes"];

/**
 * What Monarch 0.2.5 does, as a bento of small product scenes. Each scene
 * plays once, when its card is actually seen, and then rests in its final
 * state. Maturity labels match the app.
 */
export function Abilities({ copy }: { copy: Copy }) {
  return (
    <Reveal as="section" className={styles.section} labelledBy="abilities-title" id="abilities">
      <div className="shell">
        <ChapterHead id="abilities-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
        <ul className={styles.grid}>
          {copy.items.map((item) => (
            <AbilityCard key={item.id} item={item} v={copy.vignettes} example={copy.example} />
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function AbilityCard({ item, v, example }: { item: Item; v: Vignettes; example: string }) {
  const { ref, unlit } = useLit<HTMLLIElement>();
  const illustrative = ["agent", "coder", "memory", "skills", "telegram"].includes(item.id);
  return (
    <li ref={ref} className={`card ${styles.card}`} data-id={item.id} data-unlit={unlit} data-reveal>
      <div className={styles.stage} aria-hidden>
        <Vignette id={item.id} v={v} />
        {illustrative && <span className={styles.example}>{example}</span>}
      </div>
      <div className={styles.copy}>
        <h3 className={styles.title}>
          {item.title}
          {item.tag && <em className={styles.tag}>{item.tag}</em>}
        </h3>
        <p className={styles.text}>{item.text}</p>
      </div>
    </li>
  );
}

function Tick() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Vignette({ id, v }: { id: string; v: Vignettes }) {
  switch (id) {
    case "agent":
      return (
        <div className={styles.plan}>
          <div className={styles.planHead}>
            <span>
              {v.step} 3 / {v.plan.length}
            </span>
            <span className={styles.stop}>
              <i />
              {v.stop}
            </span>
          </div>
          <ol className={styles.planList}>
            {v.plan.map((step, index) => (
              <li key={step} data-state={index < 2 ? "done" : index === 2 ? "now" : "next"} style={{ "--i": index } as React.CSSProperties}>
                <span className={styles.planMark}>
                  <Tick />
                </span>
                {step}
              </li>
            ))}
          </ol>
          <span className={styles.planBar}>
            <span />
          </span>
        </div>
      );
    case "computer":
      return (
        <div className={styles.desk}>
          <div className={styles.miniWindow}>
            <p className={styles.miniTitle}>{v.window}</p>
            <span className={styles.toggleRow}>
              <i />
              <b data-on />
            </span>
            <span className={styles.toggleRow}>
              <i />
              <b />
            </span>
            <span className={styles.saveRow}>
              <span className={styles.save}>{v.button}</span>
              <span className={styles.saved}>
                <Tick />
              </span>
            </span>
          </div>
          <span className={styles.found} />
          <svg className={styles.cursor} width="20" height="22" viewBox="0 0 20 22">
            <path d="M2 1.5 17 11l-6.6 1.4L7 19.5Z" fill="#26221d" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
      );
    case "coder":
      return (
        <div className={styles.coder}>
          <ul className={styles.tree}>
            <li className={styles.folder}>{v.folder}</li>
            {v.files.map((file, index) => (
              <li key={file} data-active={index === 0}>
                {file}
              </li>
            ))}
          </ul>
          <pre className={styles.diff}>
            <span data-kind="ctx" style={{ "--i": 0 } as React.CSSProperties}>
              $src = &quot;D:\Docs&quot;
            </span>
            <span data-kind="del" style={{ "--i": 1 } as React.CSSProperties}>
              - Copy-Item $src $dst
            </span>
            <span data-kind="add" style={{ "--i": 2 } as React.CSSProperties}>
              + robocopy $src $dst /MIR
            </span>
            <span data-kind="add" style={{ "--i": 3 } as React.CSSProperties}>
              + Write-Host &quot;OK&quot;
            </span>
          </pre>
        </div>
      );
    case "memory":
      return (
        <div className={styles.memory}>
          <div className={styles.memCol}>
            <p>{v.memoryChats}</p>
            <span className={styles.memNote}>{v.memoryNote}</span>
            <span className={styles.memAnswer}>
              <i />
              {v.memoryUsed}
            </span>
          </div>
          <span className={styles.memWall} />
          <div className={styles.memCol} data-side="project">
            <p>{v.memoryProject}</p>
            <span className={styles.memGhost} />
            <span className={styles.memGhost} data-short />
          </div>
        </div>
      );
    case "voice":
      return (
        <div className={styles.voice}>
          <div className={styles.wave}>
            {WAVE.map((height, index) => (
              <span key={index} style={{ "--h": height, "--i": index } as React.CSSProperties} />
            ))}
          </div>
          <div className={styles.voiceRow}>
            <span className={styles.mic}>
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden>
                <rect x="3.5" y="1" width="5" height="8" rx="2.5" fill="currentColor" />
                <path d="M1.5 6.5a4.5 4.5 0 0 0 9 0M6 11v2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {v.dictation}
            </span>
            <span className={styles.preset}>{v.voicePreset}</span>
          </div>
        </div>
      );
    case "skills":
      return (
        <div className={styles.skills}>
          <div className={styles.menu}>
            <p>{v.skillsLabel}</p>
            {v.skills.map((skill, index) => (
              <span key={skill} data-active={index === 0} style={{ "--i": index } as React.CSSProperties}>
                <b>$</b>
                {skill}
              </span>
            ))}
          </div>
          <div className={styles.miniComposer}>
            <span className={styles.plus}>+</span>
            <span className={styles.dollar}>$</span>
            <i className={styles.caret} />
          </div>
        </div>
      );
    case "telegram":
      return (
        <div className={styles.phone}>
          <span className={styles.pair}>{v.tgCode}</span>
          <p className={styles.tgUser}>{v.tgUser}</p>
          <p className={styles.tgBot}>
            <span className={styles.tgAvatar} style={{ backgroundImage: `url("${asset("/mascot/oscar-success.webp")}")` }} />
            {v.tgBot}
          </p>
        </div>
      );
    case "sharing":
      return (
        <div className={styles.sharing}>
          <p className={styles.endpoint}>
            <MonarchMark size={14} variant="light" />
            127.0.0.1:7861/v1
          </p>
          <pre className={styles.snippet}>
            <span style={{ "--i": 0 } as React.CSSProperties}>
              <b>from</b> openai <b>import</b> OpenAI
            </span>
            <span style={{ "--i": 1 } as React.CSSProperties}>client = OpenAI(</span>
            <span style={{ "--i": 2 } as React.CSSProperties}>
              {"  "}base_url=<em>&quot;http://127.0.0.1:7861/v1&quot;</em>,
            </span>
            <span style={{ "--i": 3 } as React.CSSProperties}>)</span>
          </pre>
        </div>
      );
    default:
      return null;
  }
}

// Deterministic waveform heights (0..1), so the server and client agree.
const WAVE = Array.from({ length: 34 }, (_, index) => {
  const value = Math.abs(Math.sin(index * 1.7) * 0.6 + Math.sin(index * 0.45) * 0.4);
  return Number((0.18 + value * 0.82).toFixed(3));
});
