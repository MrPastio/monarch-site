"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { MonarchTile } from "@/components/brand/monarch-mark";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import { PixelGlyph, PixelLoader } from "@/components/pixel/pixel";
import { TIMELINES } from "./timelines";
import styles from "./release.module.css";

type Copy = Dict["release"];
type Scenes = Copy["scenes"];

/**
 * «Новое в 0.3». On wide screens the chapter pins one Monarch window while
 * the page scrolls: each scroll segment hands the window to the next feature,
 * which plays its own short scene (one GSAP timeline per scene, paused the
 * moment it loses the stage — nothing queues). Narrow screens get a plain
 * list where every scene plays once when seen. Reduced motion shows every
 * scene in its final state.
 */
export function Release({ copy }: { copy: Copy }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [story, setStory] = useState(false);
  const [active, setActive] = useState(0);
  const count = copy.items.length;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 980px)");
    const decide = () => setStory(media.matches);
    decide();
    media.addEventListener("change", decide);
    return () => media.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!story || !track) return;
    const { ScrollTrigger } = getGsap();
    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        track.style.setProperty("--progress", self.progress.toFixed(4));
        const next = Math.min(count - 1, Math.floor(self.progress * count));
        setActive((previous) => (previous === next ? previous : next));
      },
    });
    return () => trigger.kill();
  }, [story, count]);

  const jump = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const span = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((index + 0.5) / count), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section className={styles.section} aria-labelledby="release-title" id="whats-new">
      <Reveal className="shell">
        <ChapterHead id="release-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
      </Reveal>

      <div
        ref={trackRef}
        className={styles.track}
        data-story={story}
        style={{ "--count": count, "--progress": 0 } as React.CSSProperties}
      >
        <div className={styles.sticky}>
          <div className={`shell-wide ${styles.layout}`}>
            <ol className={styles.steps} aria-label={copy.stepLabel}>
              {copy.items.map((item, index) => {
                const current = !story || index === active;
                return (
                  <li
                    key={item.id}
                    className={styles.step}
                    data-active={current}
                    data-past={story && index < active}
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    {/* Pixel progress: five cells per feature fill as the page scrolls. */}
                    <span className={styles.rail} aria-hidden>
                      {[0, 1, 2, 3, 4].map((cell) => (
                        <i key={cell} style={{ "--k": cell } as React.CSSProperties} />
                      ))}
                    </span>
                    <h3 className={styles.stepTitle}>
                      {story ? (
                        <button type="button" className={styles.stepButton} onClick={() => jump(index)} aria-current={current ? "step" : undefined}>
                          <StepLabel index={index} title={item.title} tag={item.tag} />
                        </button>
                      ) : (
                        <StepLabel index={index} title={item.title} tag={item.tag} />
                      )}
                    </h3>
                    <div className={styles.stepBody}>
                      <p className={styles.stepText}>{item.text}</p>
                    </div>
                    {!story && (
                      <div className={styles.inline} aria-hidden>
                        <Window>
                          <SeenScene id={item.id} s={copy.scenes} />
                        </Window>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            {story && (
              <div className={styles.stage} aria-hidden>
                <Window counter={`${active + 1} / ${count}`}>
                  {copy.items.map((item, index) => (
                    <Scene
                      key={item.id}
                      id={item.id}
                      s={copy.scenes}
                      playing={index === active}
                      place={index < active ? "past" : index > active ? "future" : "now"}
                    />
                  ))}
                </Window>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepLabel({ index, title, tag }: { index: number; title: string; tag: string }) {
  return (
    <>
      <span className={styles.stepIndex}>{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.stepName}>{title}</span>
      {tag && <em className={styles.tag}>{tag}</em>}
    </>
  );
}

function Window({ children, counter }: { children: React.ReactNode; counter?: string }) {
  return (
    <div className={styles.window}>
      <div className={styles.titlebar}>
        <MonarchTile size={18} />
        <span>Monarch</span>
        {counter && <span className={styles.counter}>{counter}</span>}
        <span className={styles.controls}>
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={styles.viewport}>{children}</div>
    </div>
  );
}

/** A scene that plays once, the first time it is really seen (narrow screens). */
function SeenScene(props: Omit<SceneProps, "playing" | "place">) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={styles.seen}>
      <Scene {...props} playing={seen} place="now" />
    </div>
  );
}

type SceneProps = {
  id: string;
  s: Scenes;
  playing: boolean;
  place: "past" | "now" | "future";
};

/**
 * One scene = one timeline owner. Losing the stage pauses the timeline where
 * it is (the scene leaves as it looked); the context is reverted only after
 * the exit, so the next visit starts clean from the final markup.
 */
function Scene({ id, s, playing, place }: SceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pending = useRef<{ revert: () => void; timer: number } | null>(null);

  useEffect(() => {
    const root = ref.current;
    const build = TIMELINES[id];
    if (!playing || !root || !build || prefersReducedMotion()) return;
    if (pending.current) {
      window.clearTimeout(pending.current.timer);
      pending.current.revert();
      pending.current = null;
    }
    const { gsap } = getGsap();
    let timeline: gsap.core.Timeline | null = null;
    const context = gsap.context(() => {
      timeline = gsap.timeline({ defaults: { ease: "expo.out", duration: 0.6 }, delay: 0.25 });
      build(timeline, gsap.utils.selector(root), gsap);
    }, root);
    return () => {
      (timeline as gsap.core.Timeline | null)?.pause();
      const timer = window.setTimeout(() => {
        context.revert();
        pending.current = null;
      }, 900);
      pending.current = { revert: () => context.revert(), timer };
    };
  }, [playing, id]);

  useEffect(
    () => () => {
      if (pending.current) {
        window.clearTimeout(pending.current.timer);
        pending.current.revert();
      }
    },
    [],
  );

  return (
    <div ref={ref} className={styles.scene} data-scene={id} data-place={place}>
      <SceneBody id={id} s={s} />
    </div>
  );
}

function SceneBody({ id, s }: { id: string; s: Scenes }) {
  switch (id) {
    case "tasks":
      return <TaskScene s={s} />;
    case "reminders":
      return <RemindersScene s={s} />;
    case "downloads":
      return <DownloadsScene s={s} />;
    case "max":
      return <MaxScene s={s} />;
    case "coder":
      return <CoderScene s={s} />;
    case "setup":
      return <SetupScene s={s} />;
    default:
      return null;
  }
}

function Check() {
  return <PixelGlyph name="check" size={14} animate />;
}

/* ---------- 1. A task, done in the chat ---------- */
function TaskScene({ s }: { s: Scenes }) {
  const t = s.task;
  return (
    <div className={styles.chat}>
      <p className={styles.chatHead}>
        <b>{s.oscar}</b>
        <span className={styles.chatPill}>{s.newChat}</span>
      </p>
      <div className={styles.thread}>
        <p className={styles.user} data-k="prompt">
          {t.prompt}
        </p>
        <p className={styles.working} data-k="working" data-state="done">
          <span className={styles.workingLoader}>
            <PixelLoader size="m" label={t.working} />
          </span>
          <span className={styles.workingDone}>
            <PixelGlyph name="check" size={14} />
          </span>
          {t.working}
        </p>
        <ol className={styles.taskSteps}>
          {t.steps.map((step, index) => (
            <li key={step} data-k="step" data-state="done" style={{ "--i": index } as React.CSSProperties}>
              <span className={styles.square} />
              {step}
            </li>
          ))}
        </ol>
        <div className={styles.ask} data-k="ask" data-state="allowed">
          <div>
            <p className={styles.askTitle}>{t.askTitle}</p>
            <p className={styles.askReason}>{t.askReason}</p>
          </div>
          <span className={styles.allow} data-k="allow">
            {t.allow}
          </span>
        </div>
        <div className={styles.report} data-k="report">
          <p className={styles.reportTitle}>{t.reportTitle}</p>
          <div className={styles.reportChips}>
            {t.report.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.composer}>
        <span className={styles.placeholder}>{s.placeholder}</span>
        <span className={styles.send} data-k="stop" data-state="idle" aria-hidden>
          <i />
        </span>
      </div>
    </div>
  );
}

/* ---------- 2. MAX with the computer as a safety net ---------- */
function MaxScene({ s }: { s: Scenes }) {
  const m = s.max;
  return (
    <div className={styles.max}>
      {/* Threads from the composer up to both minds; scaled with the scene. */}
      <svg className={styles.routeLines} viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
        <path className={styles.lineCloud} data-k="lineCloud" d="M228,222 C250,170 286,120 318,66" pathLength={1} />
        <path className={styles.lineBroken} data-k="lineBroken" d="M228,222 C250,170 286,120 318,66" />
        <path className={styles.lineLocal} data-k="lineLocal" d="M200,222 C176,170 120,124 96,66" pathLength={1} />
      </svg>

      <span className={styles.nodeLocal} data-k="local" data-state="answering">
        <b>{m.local}</b>
        <small>{m.localSub}</small>
      </span>
      <span className={styles.nodeCloud} data-k="cloud" data-state="failed">
        <svg className={styles.cloudShape} viewBox="0 0 220 120" preserveAspectRatio="none" aria-hidden>
          <path d="M44,108 C18,108 8,90 14,74 C20,60 36,56 48,60 C50,36 70,22 92,26 C104,8 136,6 150,26 C170,18 194,32 192,56 C210,58 216,78 208,92 C202,104 190,108 176,108 Z" />
        </svg>
        <b>MAX</b>
        <small data-when="waiting">{m.waiting}</small>
        <small data-when="failed">{m.failed}</small>
      </span>

      <div className={styles.answer} data-k="answer">
        <span className={styles.fallbackLabel}>
          <i />
          {m.label}
        </span>
        <p>
          <span className={styles.typed} data-k="answerText">
            {m.answer}
          </span>
        </p>
      </div>

      <div className={styles.maxComposer} data-k="composer">
        <span className={styles.maxPrompt}>
          <span className={styles.typed} data-k="maxPrompt">
            {m.prompt}
          </span>
        </span>
        <span className={styles.maxToggle} data-k="toggle" data-on="true">
          MAX
          <i />
        </span>
        <span className={styles.sendInk} aria-hidden>
          <PixelGlyph name="arrow-up" size={14} />
        </span>
      </div>
    </div>
  );
}

/* ---------- 2. A reminder: asked in the chat, delivered by Windows ---------- */
function RemindersScene({ s }: { s: Scenes }) {
  const r = s.reminders;
  return (
    <div className={styles.chat}>
      <p className={styles.chatHead}>
        <b>{s.oscar}</b>
        <span className={styles.chatPill}>{s.newChat}</span>
      </p>
      <div className={styles.thread}>
        <p className={styles.user} data-k="remPrompt">
          {r.prompt}
        </p>
        <p className={styles.remAnswer} data-k="remAnswer">
          <Check />
          {r.answer}
        </p>
        <p className={styles.remClock} data-k="remClock" aria-hidden>
          <span className={styles.remClockFace} />
          <b data-k="remTime" data-time="due">
            <span data-when="now">{r.now}</span>
            <span data-when="due">{r.due}</span>
          </b>
        </p>
      </div>
      <div className={styles.remToast} data-k="remToast">
        <span className={styles.remToastKicker}>{r.toastKicker}</span>
        <b>{r.toastText}</b>
        <span className={styles.remToastActions}>
          <span>{r.done}</span>
          <span>{r.snooze}</span>
        </span>
      </div>
      <div className={styles.composer}>
        <span className={styles.placeholder}>{s.placeholder}</span>
        <span className={styles.send} data-k="remSend" data-state="idle" aria-hidden>
          <i />
        </span>
      </div>
    </div>
  );
}

/* ---------- 3. Everything a feature needs, downloaded by Monarch ---------- */
function DownloadsScene({ s }: { s: Scenes }) {
  const d = s.downloads;
  return (
    <div className={styles.downloads}>
      <p className={styles.dlTitle}>{d.title}</p>
      <ul className={styles.dlList}>
        {d.items.map((item, index) => (
          <li key={item.name} data-k="dlRow" data-state="done" style={{ "--i": index } as React.CSSProperties}>
            <span className={styles.dlName}>
              <b>{item.name}</b>
              <small>{item.what}</small>
            </span>
            <span className={styles.dlSize}>{item.size}</span>
            <span className={styles.dlAction}>
              <span className={styles.dlButton} data-k="dlButton">
                {d.download}
              </span>
              <span className={styles.bar}>
                <i data-k="dlBar" style={{ "--w": 1 } as React.CSSProperties} />
              </span>
              <span className={styles.dlReady} data-k="dlReady">
                <Check />
                {d.ready}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.added} data-k="dlNote">
        <Check />
        {d.note}
      </p>
    </div>
  );
}

/* ---------- 5. Coder, rebuilt ---------- */
const DIFF: { kind: " " | "-" | "+"; text: string }[] = [
  { kind: " ", text: ":root {" },
  { kind: "-", text: "  --bg: #ffffff;" },
  { kind: "-", text: "  --ink: #1a1916;" },
  { kind: "+", text: "  --bg: light-dark(#fff, #141311);" },
  { kind: "+", text: "  --ink: light-dark(#1a1916, #f4f2ee);" },
  { kind: " ", text: "}" },
];

function CoderScene({ s }: { s: Scenes }) {
  const c = s.coder;
  return (
    <div className={styles.coder}>
      <aside className={styles.coderSide}>
        <p className={styles.project}>
          <span className={styles.folder} />
          {c.project}
        </p>
        <span className={styles.conversation} data-current="true">
          {c.conversation}
        </span>
        <span className={styles.conversationGhost} />
        <span className={styles.conversationGhost} data-short />
      </aside>
      <div className={styles.coderMain}>
        <p className={styles.coderUser} data-k="coderUser">
          {c.conversation}
        </p>
        <p className={styles.readChip} data-k="read">
          <Check />
          {c.read} <code>styles.css</code>
        </p>
        <div className={styles.diff} data-k="diff">
          <p className={styles.diffHead}>
            <code>styles.css</code>
            <span>
              <b className={styles.minus}>−2</b> <b className={styles.plus}>+2</b>
            </span>
          </p>
          <pre>
            {DIFF.map((line, index) => (
              <span key={index} data-k="diffLine" data-kind={line.kind}>
                <i>{line.kind}</i>
                {line.text}
              </span>
            ))}
          </pre>
          <span className={styles.allow} data-k="coderAllow">
            <Check />
            {c.allow}
          </span>
        </div>
        <div className={styles.checks}>
          <span>{c.checks}</span>
          <span className={styles.checkCells}>
            {Array.from({ length: 6 }, (_, index) => (
              <i key={index} data-k="cell" data-on="true" />
            ))}
          </span>
          <b data-k="checksDone">{c.checksDone}</b>
        </div>
      </div>
    </div>
  );
}

/* ---------- 6. First setup ---------- */
function SetupScene({ s }: { s: Scenes }) {
  return (
    <div className={styles.setup}>
      <SetupBody s={s} />
      <div className={`night ${styles.setupNight}`} data-k="night">
        <SetupBody s={s} />
      </div>
    </div>
  );
}

function SetupBody({ s }: { s: Scenes }) {
  const u = s.setup;
  return (
    <div className={styles.setupBody} data-k="setupBody" data-lang="0" data-pick="2">
      <div className={styles.hello}>
        <span className={styles.helloReel}>
          {u.hello.map((word) => (
            <b key={word}>{word}</b>
          ))}
        </span>
      </div>
      <div className={styles.langs}>
        <span className={styles.langPill} aria-hidden />
        {u.languages.map((language) => (
          <span key={language}>{language}</span>
        ))}
      </div>
      <div className={styles.themes}>
        <span className={styles.theme} data-theme="light" data-on="true">
          <i />
          {u.light}
        </span>
        <span className={styles.theme} data-theme="dark">
          <i />
          {u.dark}
        </span>
      </div>
      <p className={styles.question}>{u.question}</p>
      <div className={styles.options}>
        {u.options.map((option, index) => (
          <span key={option} className={styles.option} data-index={index}>
            <span className={styles.optionIcon} data-kind={index} />
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}
