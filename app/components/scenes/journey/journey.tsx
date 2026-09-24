"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { getGsap, prefersReducedMotion } from "@/components/motion/gsap";
import styles from "./journey.module.css";

type Copy = Dict["journey"];
type Scenario = Copy["scenarios"][number];
type StationId = Copy["stations"][number]["id"];

const POLICY_INDEX = 3;
const POSES = ["listening", "thinking", "coding", "security", "success", "error"] as const;

export function Journey({ copy }: { copy: Copy }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const [scenarioId, setScenarioId] = useState(copy.scenarios[0]!.id);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [pinned, setPinned] = useState(false);
  const progressRef = useRef(0);
  const railRef = useRef<HTMLDivElement>(null);

  const scenario = copy.scenarios.find((item) => item.id === scenarioId)!;
  const stations = copy.stations;
  const denied = scenario.verdict === "deny";
  const lastReachable = denied ? POLICY_INDEX : stations.length - 1;
  const shown = Math.min(active, lastReachable);
  const station = stations[shown]!;
  const endedInDeny = denied && active >= POLICY_INDEX;

  const poseFor = (id: StationId): (typeof POSES)[number] => {
    if (endedInDeny && id === "policy") return "error";
    return copy.oscarStates[id as keyof Copy["oscarStates"]] as (typeof POSES)[number];
  };
  const pose = poseFor(station.id);

  // Scroll drives the journey on large screens; each station owns an equal
  // stretch of the pinned scene. Scrolling back walks the request back.
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    const media = gsap.matchMedia();
    media.add("(min-width: 1000px)", () => {
      setPinned(true);
      const trigger = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: () => `+=${window.innerHeight * 3.2}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          railRef.current?.style.setProperty("--p", self.progress.toFixed(4));
          const next = Math.min(stations.length - 1, Math.floor(self.progress * stations.length));
          setActive((current) => {
            if (current !== next) setDirection(next > current ? 1 : -1);
            return next;
          });
        },
      });
      return () => {
        trigger.kill();
        setPinned(false);
      };
    });
    return () => media.revert();
  }, [stations.length]);

  const go = (index: number) => {
    setDirection(index >= active ? 1 : -1);
    setActive(index);
  };

  return (
    <Reveal as="section" className={styles.section} labelledBy="journey-title">
      <div className="shell">
        <ChapterHead id="journey-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />
      </div>

      <div ref={pinRef} className={styles.pinWrap} data-pin>
        <div className={`shell-wide ${styles.stage}`} data-pinned={pinned}>
          <div className={styles.scenarios} role="tablist" aria-label={copy.choose}>
            <span className={styles.chooseLabel}>{copy.choose}</span>
            {copy.scenarios.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === scenarioId}
                className={styles.scenario}
                data-verdict={item.verdict}
                onClick={() => setScenarioId(item.id)}
              >
                <span className={styles.scenarioDot} aria-hidden />
                {item.prompt}
              </button>
            ))}
          </div>

          <div ref={railRef} className={styles.rail} data-verdict={scenario.verdict} style={{ "--count": stations.length, "--a": shown } as React.CSSProperties}>
            <div className={styles.railLine} aria-hidden>
              <span className={styles.railFill}>
                <span className={styles.capsule} />
              </span>
            </div>
            <ol className={styles.nodes}>
              {stations.map((item, index) => {
                const state =
                  denied && index > POLICY_INDEX
                    ? "skipped"
                    : index < shown
                      ? "done"
                      : index === shown
                        ? endedInDeny && index === POLICY_INDEX
                          ? "denied"
                          : "active"
                        : "idle";
                return (
                  <li key={item.id} className={styles.node} data-state={state}>
                    <button type="button" onClick={() => go(index)} className={styles.nodeButton} aria-current={index === shown ? "step" : undefined}>
                      <span className={styles.nodeDot} aria-hidden />
                      <span className={styles.nodeTitle}>{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={styles.body}>
            <figure className={styles.oscar} aria-hidden>
              {POSES.map((name) => (
                <Image
                  key={name}
                  src={`/mascot/oscar-${name}.png`}
                  alt=""
                  width={512}
                  height={512}
                  sizes="260px"
                  className={styles.pose}
                  data-on={name === pose}
                  priority={false}
                />
              ))}
              <figcaption className={styles.oscarCaption}>Оскар</figcaption>
            </figure>

            <div className={styles.panelWrap}>
              <article key={`${scenario.id}-${station.id}`} className={`glass ${styles.panel}`} data-dir={direction}>
                <header className={styles.panelHead}>
                  <span className={styles.panelIndex}>{String(shown + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{station.title}</h3>
                    <p>{station.text}</p>
                  </div>
                </header>
                <StationArt id={station.id} scenario={scenario} copy={copy} denied={endedInDeny} />
              </article>
            </div>
          </div>
        </div>
      </div>

      <div className={`shell ${styles.limits}`}>
        <div data-reveal className={styles.limitsCard}>
          <p className="kicker">{copy.hardLimitsTitle}</p>
          <ul>
            {copy.hardLimits.map((limit) => (
              <li key={limit}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3.3 12.7 12.7 3.3" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

function StationArt({ id, scenario, copy, denied }: { id: StationId; scenario: Scenario; copy: Copy; denied: boolean }) {
  switch (id) {
    case "ask":
      return (
        <div className={styles.art}>
          <div className={styles.composer}>
            <span className={styles.typed}>{scenario.prompt}</span>
            <span className={styles.caret} aria-hidden />
            <span className={styles.send} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 13V3m0 0L3.5 7.5M8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      );
    case "oscar":
      return (
        <div className={styles.art}>
          <div className={styles.parse}>
            {scenario.prompt.split(" ").map((word, index) => (
              <span key={index} className={styles.token} style={{ "--i": index } as React.CSSProperties} data-kind={index === 0 ? "verb" : "object"}>
                {word}
              </span>
            ))}
          </div>
          <div className={styles.parseLegend}>
            <span data-kind="verb">команда</span>
            <span data-kind="object">цель</span>
          </div>
        </div>
      );
    case "action":
      return (
        <div className={styles.art}>
          <pre className={styles.actionCard}>
            <span className={styles.codeKey}>действие</span> {scenario.action}
            {"\n"}
            <span className={styles.codeKey}>источник</span> рабочий стол · твой запрос
            {"\n"}
            <span className={styles.codeKey}>модель</span> предлагает, не исполняет
          </pre>
        </div>
      );
    case "policy":
      return (
        <div className={styles.art}>
          <div className={styles.gate} data-verdict={scenario.verdict}>
            {(["allow", "confirm", "deny"] as const).map((lane) => (
              <div key={lane} className={styles.lane} data-lane={lane} data-on={lane === scenario.verdict}>
                <span className={styles.laneTrack}>
                  <span className={styles.token2} />
                </span>
                <span className={styles.laneLabel}>{copy.lanes[lane]}</span>
              </div>
            ))}
          </div>
          <p className={styles.verdict} data-verdict={scenario.verdict}>
            {scenario.verdictText}
          </p>
          {scenario.verdict === "confirm" && (
            <div className={styles.consent}>
              <span>Разрешить поиск в интернете один раз?</span>
              <span className={styles.consentYes}>Разрешить</span>
            </div>
          )}
          {denied && <p className={styles.deniedNote}>{scenario.receipt}</p>}
        </div>
      );
    case "kernel":
      return (
        <div className={styles.art}>
          <div className={styles.progress}>
            {["Проверить одобрение", "Выполнить", "Записать событие"].map((step, index) => (
              <div key={step} className={styles.progressStep} style={{ "--i": index } as React.CSSProperties}>
                <span className={styles.check} aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      );
    case "verify":
      return (
        <div className={styles.art}>
          <div className={styles.verify}>
            <div className={styles.window}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.lens} aria-hidden />
            <p>{scenario.check}</p>
          </div>
        </div>
      );
    case "receipt":
      return (
        <div className={styles.art}>
          <div className={styles.receipt}>
            <p className={styles.receiptHead}>{copy.receiptLabel}</p>
            <dl>
              <div>
                <dt>Запрос</dt>
                <dd>{scenario.prompt}</dd>
              </div>
              <div>
                <dt>Действие</dt>
                <dd>{scenario.action}</dd>
              </div>
              <div>
                <dt>Решение</dt>
                <dd>{copy.lanes[scenario.verdict as "allow" | "confirm" | "deny"]}</dd>
              </div>
              <div>
                <dt>Проверка</dt>
                <dd>{scenario.check}</dd>
              </div>
            </dl>
            <p className={styles.receiptResult}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <path d="M3.5 9.4 7.2 13l7.3-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className={styles.drawCheck} />
              </svg>
              {scenario.receipt}
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
}
