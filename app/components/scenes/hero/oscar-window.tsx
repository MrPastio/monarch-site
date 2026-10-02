"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { MonarchTile } from "@/components/brand/monarch-mark";
import { prefersReducedMotion } from "@/components/motion/gsap";
import { asset } from "@/lib/asset";
import { PixelGlyph, PixelLoader } from "@/components/pixel/pixel";
import styles from "./oscar-window.module.css";

type Journey = Dict["journey"];
type Scenario = Journey["scenarios"][number];
type WindowCopy = Dict["hero"]["window"];
type Stage = "idle" | "typing" | "sent" | "thinking" | "plan" | "consent" | "run" | "receipt";
type Pose = "idle" | "listening" | "thinking" | "coding" | "security" | "success" | "error";

const ORDER: Stage[] = ["idle", "typing", "sent", "thinking", "plan", "consent", "run", "receipt"];
const POSES: Pose[] = ["idle", "listening", "thinking", "coding", "security", "success", "error"];
const TYPE_MS = 36;

/** Relative delays between stages. Denied requests stop at the policy gate. */
function script(scenario: Scenario): [Stage, number][] {
  const typing = 280 + scenario.prompt.length * TYPE_MS;
  const steps: [Stage, number][] = [
    ["sent", typing + 260],
    ["thinking", 420],
    ["plan", 1150],
  ];
  if (scenario.verdict === "deny") return [...steps, ["receipt", 1500]];
  if (scenario.verdict === "confirm") steps.push(["consent", 1500]);
  steps.push(["run", scenario.verdict === "confirm" ? 650 : 1100], ["receipt", 1450]);
  return steps;
}

function poseFor(stage: Stage, denied: boolean): Pose {
  switch (stage) {
    case "idle":
      return "idle";
    case "typing":
    case "sent":
      return "listening";
    case "thinking":
      return "thinking";
    case "plan":
      return denied ? "error" : "security";
    case "consent":
      return "security";
    case "run":
      return "coding";
    case "receipt":
      return denied ? "error" : "success";
  }
}

/**
 * The product, not a picture of it: a Monarch window in which Oscar takes a
 * real request through plan, permission, execution and a receipt.
 * One owner of the motion (this timeline); choosing another request cuts the
 * current one immediately instead of queueing. Reduced motion shows the result.
 */
export function OscarWindow({ journey, ui, copy }: { journey: Journey; ui: Dict["ui"]; copy: WindowCopy }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [scenarioId, setScenarioId] = useState(journey.scenarios[0]!.id);
  const [stage, setStage] = useState<Stage>("idle");
  const [typed, setTyped] = useState(0);
  const [run, setRun] = useState(0);
  const composerTextRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const fromRect = useRef<DOMRect | null>(null);

  const scenario = journey.scenarios.find((item) => item.id === scenarioId)!;
  const denied = scenario.verdict === "deny";
  const reached = (target: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(target);
  const pose = poseFor(stage, denied);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const play = useCallback(
    (id: string) => {
      clear();
      const next = journey.scenarios.find((item) => item.id === id)!;
      setScenarioId(id);
      setRun((value) => value + 1);
      if (prefersReducedMotion()) {
        setTyped(next.prompt.length);
        setStage("receipt");
        return;
      }
      setTyped(0);
      setStage("typing");
      const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
      for (let i = 1; i <= next.prompt.length; i++) at(280 + i * TYPE_MS, () => setTyped(i));
      let clock = 0;
      for (const [nextStage, delay] of script(next)) {
        clock += delay;
        at(clock, () => {
          // The typed words leave the composer and become the message.
          if (nextStage === "sent") fromRect.current = composerTextRef.current?.getBoundingClientRect() ?? null;
          setStage(nextStage);
        });
      }
    },
    [journey.scenarios],
  );

  // Continuity: the sent bubble starts where the typed text was.
  useLayoutEffect(() => {
    if (stage !== "sent") return;
    const bubble = bubbleRef.current;
    const from = fromRect.current;
    fromRect.current = null;
    if (!bubble || !from || prefersReducedMotion()) return;
    const to = bubble.getBoundingClientRect();
    bubble.animate(
      [
        { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`, opacity: 0.5, borderColor: "transparent", backgroundColor: "transparent" },
        { transform: "none", opacity: 1 },
      ],
      { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }, [stage]);

  // Start once, when the window is actually seen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          play(journey.scenarios[0]!.id);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      clear();
    };
  }, [play, journey.scenarios]);

  const composerText = stage === "typing" ? scenario.prompt.slice(0, typed) : "";
  const chatTitle = reached("sent") ? scenario.prompt : copy.newChat;

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.frame}>
        <figure className={styles.oscar} aria-hidden>
          {POSES.map((name) => (
            <Image
              key={name}
              src={asset(`/mascot/oscar-${name}.webp`)}
              alt=""
              width={384}
              height={384}
              sizes="200px"
              className={styles.pose}
              data-on={name === pose}
            />
          ))}
        </figure>

        <div className={styles.window} role="img" aria-label={copy.label}>
          <div className={styles.titlebar}>
            <MonarchTile size={18} />
            <span>Monarch</span>
            <span className={styles.caption} aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </div>

          <div className={styles.app}>
            <aside className={styles.sidebar}>
              <span className={styles.newChat}>
                <PixelGlyph name="plus" size={12} />
                {copy.newChat}
              </span>
              <p className={styles.sideLabel}>{copy.recent}</p>
              <ul className={styles.chats}>
                <li data-active>{chatTitle}</li>
                {copy.chats.map((chat) => (
                  <li key={chat}>{chat}</li>
                ))}
              </ul>
              <div className={styles.sideFoot}>
                <span>
                  <PixelGlyph name="lock" size={12} />
                  {copy.safe}
                </span>
                <span>
                  <i className={styles.okDot} />
                  {copy.security}
                </span>
              </div>
            </aside>

            <div className={styles.chat}>
              <header className={styles.chatHead}>
                <span className={styles.chatTitle}>{chatTitle}</span>
                <span className={styles.chip}>
                  <i className={styles.okDot} />
                  {copy.model} · {copy.local}
                </span>
              </header>

              <div className={styles.thread} key={run}>
                {!reached("sent") && (
                  <div className={styles.empty}>
                    <MonarchTile size={44} />
                    <p>{copy.greeting}</p>
                  </div>
                )}

                {reached("sent") && (
                  <p ref={bubbleRef} className={styles.user}>
                    {scenario.prompt}
                  </p>
                )}

                {reached("thinking") && (
                  <div className={styles.oscarRow}>
                    <span className={styles.avatar} style={{ backgroundImage: `url("${asset(`/mascot/oscar-${pose}.webp`)}")` }} />
                    <div className={styles.oscarBody}>
                      {!reached("plan") && (
                        <p className={styles.thinking}>
                          <PixelLoader size="s" label={copy.thinking} />
                          {copy.thinking}
                        </p>
                      )}

                      {reached("plan") && (
                        <div className={styles.plan} data-verdict={scenario.verdict}>
                          <p className={styles.planLabel}>{copy.plan}</p>
                          <p className={styles.action}>
                            <span className={styles.key}>{ui.actionKeys[0]}</span>
                            {scenario.action}
                          </p>
                          <p className={styles.verdict} data-verdict={scenario.verdict}>
                            <VerdictGlyph verdict={scenario.verdict} />
                            <strong>{journey.lanes[scenario.verdict as keyof Journey["lanes"]]}</strong>
                            <span>{scenario.verdictText}</span>
                          </p>
                          {scenario.verdict === "confirm" && (
                            <div className={styles.consent} data-pressed={reached("consent")}>
                              <span>{ui.consentAsk}</span>
                              <span className={styles.consentButton}>{reached("consent") ? copy.allowedOnce : ui.consentYes}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {reached("run") && !denied && (
                        <div className={styles.run} data-done={reached("receipt")}>
                          {reached("receipt") ? (
                            <p className={styles.runDone}>
                              <Tick />
                              {copy.done}
                            </p>
                          ) : (
                            ui.kernelSteps.map((step, index) => (
                              <p key={step} className={styles.runStep} style={{ "--i": index } as React.CSSProperties}>
                                <Tick />
                                {step}
                              </p>
                            ))
                          )}
                        </div>
                      )}

                      {reached("receipt") && (
                        <div className={styles.receipt} data-verdict={scenario.verdict}>
                          <p className={styles.receiptHead}>{journey.receiptLabel}</p>
                          <p className={styles.receiptResult}>
                            <PixelGlyph name={denied ? "cross" : "check"} size={21} animate />
                            {scenario.receipt}
                          </p>
                          <p className={styles.receiptCheck}>
                            <span className={styles.key}>{ui.receiptKeys[3]}</span>
                            {scenario.check}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.composer} data-typing={stage === "typing"}>
                <span ref={composerTextRef} className={composerText ? styles.typed : styles.placeholder}>
                  {composerText || copy.placeholder}
                  {stage === "typing" && <i className={styles.caret} />}
                </span>
                <span className={styles.composerRow}>
                  <span className={styles.tool}>
                    <PixelGlyph name="plus" size={12} />
                  </span>
                  <span className={styles.tool}>
                    <PixelGlyph name="search" size={12} />
                  </span>
                  <span className={styles.send} data-armed={Boolean(composerText)}>
                    <PixelGlyph name="send" size={14} />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.tries} role="group" aria-label={copy.try}>
        <span className={styles.triesLabel}>{copy.try}</span>
        {journey.scenarios.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.try}
            data-verdict={item.verdict}
            aria-pressed={item.id === scenarioId}
            onClick={() => play(item.id)}
          >
            <span className={styles.tryDot} aria-hidden />
            {item.prompt}
          </button>
        ))}
      </div>

    </div>
  );
}

function Tick() {
  return (
    <span className={styles.tick} aria-hidden>
      <PixelGlyph name="check" size={14} animate />
    </span>
  );
}

/* Status is a glyph shape, never a colour: check, alert, cross. */
function VerdictGlyph({ verdict }: { verdict: string }) {
  return <PixelGlyph name={verdict === "deny" ? "cross" : verdict === "confirm" ? "alert" : "check"} size={14} animate />;
}
