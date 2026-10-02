"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { MonarchMark } from "@/components/brand/monarch-mark";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import { asset } from "@/lib/asset";
import { TIMELINES } from "./timelines";
import styles from "./release.module.css";

type Copy = Dict["release"];
type Scenes = Copy["scenes"];
type Access = Dict["access"];
type Lanes = Dict["journey"]["lanes"];
type Verdict = keyof Lanes;

/**
 * «Новое в 0.3». On wide screens the chapter pins one Monarch window while
 * the page scrolls: each scroll segment hands the window to the next feature,
 * which plays its own short scene (one GSAP timeline per scene, paused the
 * moment it loses the stage — nothing queues). Narrow screens get a plain
 * list where every scene plays once when seen. Reduced motion shows every
 * scene in its final state.
 */
export function Release({ copy, access, lanes }: { copy: Copy; access: Access; lanes: Lanes }) {
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
                    <span className={styles.rail} aria-hidden>
                      <i />
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
                          <SeenScene id={item.id} s={copy.scenes} access={access} lanes={lanes} />
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
                      access={access}
                      lanes={lanes}
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
        <MonarchMark size={14} variant="light" />
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
  access: Access;
  lanes: Lanes;
  playing: boolean;
  place: "past" | "now" | "future";
};

/**
 * One scene = one timeline owner. Losing the stage pauses the timeline where
 * it is (the scene leaves as it looked); the context is reverted only after
 * the exit, so the next visit starts clean from the final markup.
 */
function Scene({ id, s, access, lanes, playing, place }: SceneProps) {
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
      <SceneBody id={id} s={s} access={access} lanes={lanes} />
    </div>
  );
}

function SceneBody({ id, s, access, lanes }: { id: string; s: Scenes; access: Access; lanes: Lanes }) {
  switch (id) {
    case "tasks":
      return <TaskScene s={s} />;
    case "max":
      return <MaxScene s={s} />;
    case "models":
      return <ModelsScene s={s} />;
    case "access":
      return <AccessScene s={s} access={access} lanes={lanes} />;
    case "coder":
      return <CoderScene s={s} />;
    case "setup":
      return <SetupScene s={s} />;
    default:
      return null;
  }
}

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ pose }: { pose: string }) {
  return <span className={styles.avatar} style={{ backgroundImage: `url("${asset(`/mascot/oscar-${pose}.webp`)}")` }} />;
}

/* ---------- 1. A task, done in the chat ---------- */
function TaskScene({ s }: { s: Scenes }) {
  const t = s.task;
  return (
    <div className={styles.chat}>
      <p className={styles.user} data-k="prompt">
        <span className={styles.typed}>{t.prompt}</span>
      </p>
      <div className={styles.oscar}>
        <Avatar pose="success" />
        <div className={styles.oscarBody}>
          <ol className={styles.taskSteps}>
            {t.steps.map((step, index) => (
              <li key={step} data-k="step" data-state="done" style={{ "--i": index } as React.CSSProperties}>
                <span className={styles.stepMark}>
                  <Check />
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className={styles.ask} data-k="ask" data-state="allowed">
            <p className={styles.askTitle}>{t.askTitle}</p>
            <p className={styles.askReason}>{t.askReason}</p>
            <span className={styles.allow} data-k="allow">
              <Check />
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
      </div>
      <div className={styles.composer}>
        <span className={styles.placeholder} />
        <span className={styles.stop} data-k="stop" data-state="idle">
          <i />
          {s.stop}
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
      <div className={styles.maxComposer} data-k="composer">
        <span className={styles.maxPrompt}>
          <span className={styles.typed} data-k="maxPrompt">
            {m.prompt}
          </span>
        </span>
        <span className={styles.maxToggle} data-k="toggle" data-on="true">
          <i />
          MAX
        </span>
      </div>

      <div className={styles.route}>
        <svg className={styles.routeLines} viewBox="0 0 400 150" preserveAspectRatio="none">
          <path className={styles.lineCloudTrack} d="M60 75 C 160 75, 200 28, 320 28" pathLength={1} />
          <path className={styles.lineCloud} data-k="lineCloud" d="M60 75 C 160 75, 200 28, 320 28" pathLength={1} />
          <path className={styles.lineBroken} data-k="lineBroken" d="M60 75 C 160 75, 200 28, 320 28" />
          <path className={styles.lineLocal} data-k="lineLocal" d="M60 75 C 160 75, 200 122, 320 122" pathLength={1} />
        </svg>
        <span className={styles.nodeYou}>
          <MonarchMark size={18} variant="light" />
        </span>
        <span className={styles.nodeCloud} data-k="cloud" data-state="failed">
          <svg width="18" height="14" viewBox="0 0 20 14" aria-hidden>
            <path d="M5.5 13a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 15.4 4.5 4.25 4.25 0 0 1 15 13z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>
            <b>{m.cloud}</b>
            <small data-when="waiting">{m.waiting}</small>
            <small data-when="failed">{m.failed}</small>
          </span>
        </span>
        <span className={styles.nodeLocal} data-k="local" data-state="answering">
          <svg width="18" height="16" viewBox="0 0 20 16" aria-hidden>
            <rect x="1.5" y="1.5" width="17" height="10.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <b>{m.local}</b>
        </span>
      </div>

      <div className={styles.answer} data-k="answer">
        <span className={styles.fallbackLabel}>{m.label}</span>
        <p>
          <span className={styles.typed} data-k="answerText">
            {m.answer}
          </span>
        </p>
      </div>

      <div className={styles.switchRow}>
        <span>{m.fallback}</span>
        <span className={styles.switch} data-on="true" />
      </div>
    </div>
  );
}

/* ---------- 3. Your own models ---------- */
function ModelsScene({ s }: { s: Scenes }) {
  const m = s.models;
  return (
    <div className={styles.models}>
      <div className={styles.drop} data-k="drop">
        <span className={styles.dropHint} data-k="dropHint">
          {m.drop}
        </span>
        <div className={styles.modelCard} data-k="card">
          <p className={styles.modelHead}>
            <b>{m.name}</b>
            <small>{m.link}</small>
          </p>
          <ul className={styles.modelVariants}>
            {m.variants.map((variant, index) => {
              const fits = index < 3;
              return (
                <li
                  key={variant}
                  data-k="variant"
                  data-fits={fits}
                  data-picked={index === 1}
                  style={{ "--w": [0.3, 0.41, 0.53, 1][index], "--i": index } as React.CSSProperties}
                >
                  <span>{variant}</span>
                  <span className={styles.bar}>
                    <i data-k="bar" />
                  </span>
                  <small>{m.sizes[index]}</small>
                  <em>{fits ? m.fits : m.tight}</em>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className={styles.file} data-k="file">
        <span className={styles.fileIcon} />
        <span>
          <b>{m.name}</b>
          <small>{m.sizes[1]}</small>
        </span>
      </div>
      <p className={styles.added} data-k="added">
        <Check />
        {m.added}
      </p>
    </div>
  );
}

/* ---------- 4. Access ---------- */
function AccessScene({ s, access, lanes }: { s: Scenes; access: Access; lanes: Lanes }) {
  const verdicts: Verdict[] = ["allow", "confirm", "deny"];
  const finalMode = 1;
  return (
    <div className={styles.access} data-k="access" data-mode={finalMode}>
      <p className={styles.accessTitle}>{s.access.title}</p>
      <div className={styles.modes}>
        <span className={styles.modePill} aria-hidden />
        {access.modes.map((mode, index) => (
          <span key={mode.id} className={styles.mode} data-index={index}>
            {mode.name}
          </span>
        ))}
      </div>
      <ul className={styles.matrix}>
        {access.actions.map((action) => (
          <li key={action.id}>
            <span>{action.text}</span>
            <span className={styles.drum} data-k="drum" data-verdicts={action.verdicts.join(" ")} data-verdict={action.verdicts[finalMode]}>
              <span className={styles.drumReel}>
                {verdicts.map((verdict) => (
                  <i key={verdict} data-v={verdict}>
                    {lanes[verdict]}
                  </i>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.reason} data-k="reason">
        <span className={styles.reasonDot} />
        {s.access.reason}
      </div>
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
