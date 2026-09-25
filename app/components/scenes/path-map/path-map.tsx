"use client";

import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { useLit } from "@/components/motion/marked";
import { prefersReducedMotion } from "@/components/motion/gsap";
import { AccessModes } from "@/components/scenes/access/access-modes";
import styles from "./path-map.module.css";

type Copy = Dict["journey"];
type Verdict = "allow" | "confirm" | "deny";

// Station x positions on a 1200-wide line; the gate is station 4 (index 3).
const at = (index: number) => Math.round(((index + 0.5) * 1200) / 7);
const X = [at(0), at(1), at(2), at(3), at(4), at(5), at(6)] as const;
const Y = 70;
const LANE = { confirm: 22, deny: 118 };
const PILL_X = X[3] + 86;
const PILL_W = 136;
const STOP_X = PILL_X + PILL_W / 2 + 26;

const paths: Record<Verdict, string> = {
  allow: `M${X[0]} ${Y} H${X[6]}`,
  confirm: `M${X[0]} ${Y} H${X[3]} C ${X[3] + 50} ${Y}, ${X[3] + 30} ${LANE.confirm}, ${X[3] + 80} ${LANE.confirm} H${X[3] + 104} C ${X[3] + 154} ${LANE.confirm}, ${X[4] - 40} ${Y}, ${X[4] + 10} ${Y} H${X[6]}`,
  deny: `M${X[0]} ${Y} H${X[3]} C ${X[3] + 50} ${Y}, ${X[3] + 30} ${LANE.deny}, ${X[3] + 80} ${LANE.deny} H${STOP_X - 14}`,
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The request path as a line you can follow: seven stations and one fork —
 * the policy gate — where the request goes on, waits for you, or stops.
 * One rAF timeline owns the motion: the line is drawn under a travelling
 * request, stations light as it passes them; switching requests restarts it.
 */
export function PathMap({
  copy,
  verdicts,
  access,
  indexed = true,
}: {
  copy: Copy;
  verdicts: Dict["pages"]["security"]["verdicts"];
  access?: Dict["access"];
  indexed?: boolean;
}) {
  const [scenarioId, setScenarioId] = useState(copy.scenarios[0]!.id);
  const scenario = copy.scenarios.find((item) => item.id === scenarioId)!;
  const verdict = scenario.verdict as Verdict;
  const { ref, unlit } = useLit<HTMLDivElement>();
  const liveRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGGElement>(null);
  const nodesRef = useRef<(SVGCircleElement | null)[]>([]);
  const stationsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const live = liveRef.current;
    const token = tokenRef.current;
    if (!live || !token || unlit !== undefined) return;
    const total = live.getTotalLength();
    const reduced = prefersReducedMotion();
    const duration = verdict === "deny" ? 1500 : 2100;
    let frame = 0;
    let start = 0;

    const paint = (p: number, recoil = 0) => {
      const len = total * p;
      live.style.strokeDashoffset = String(1 - p);
      const point = live.getPointAtLength(Math.max(0, len - recoil));
      token.setAttribute("transform", `translate(${point.x} ${point.y})`);
      X.forEach((x, index) => {
        const reachable = verdict !== "deny" || index <= 3;
        const passed = reachable && point.x >= x - 2;
        nodesRef.current[index]?.setAttribute("data-passed", String(passed));
        stationsRef.current[index]?.setAttribute("data-passed", String(passed));
      });
    };

    if (reduced) {
      frame = requestAnimationFrame(() => {
        paint(1);
        setArrived(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    const tick = (now: number) => {
      if (!start) {
        start = now;
        setArrived(false);
      }
      const t = Math.min(1, (now - start) / duration);
      // On a denied request the token hits the stop and gives back a little.
      const recoil = verdict === "deny" && t > 0.92 ? Math.sin(((t - 0.92) / 0.08) * Math.PI) * 7 : 0;
      paint(ease(t), recoil);
      if (t < 1) frame = requestAnimationFrame(tick);
      else setArrived(true);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scenarioId, verdict, unlit]);

  const reachable = (index: number) => verdict !== "deny" || index <= 3;

  return (
    <Reveal as="section" className={styles.section} labelledBy="route-title" id="route">
      <div className="shell">
        <ChapterHead id="route-title" index={indexed ? copy.index : undefined} kicker={copy.kicker} title={copy.title} lede={copy.lede} align="center" />

        <div className={styles.tabs} role="group" aria-label={copy.choose} data-reveal>
          {copy.scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === scenarioId}
              className={styles.tab}
              data-verdict={item.verdict}
              onClick={() => setScenarioId(item.id)}
            >
              <span className={styles.tabDot} aria-hidden />
              {item.prompt}
            </button>
          ))}
        </div>

        <div ref={ref} className={`card ${styles.board}`} data-verdict={verdict} data-unlit={unlit} data-arrived={arrived} data-reveal>
          <svg className={styles.map} viewBox="0 0 1200 150" aria-hidden>
            <path d={paths.allow} className={styles.base} />
            <path d={paths.confirm} className={styles.base} />
            <path d={paths.deny} className={styles.base} />
            <path key={scenarioId} ref={liveRef} d={paths[verdict]} className={styles.live} pathLength={1} />
            {(["confirm", "allow", "deny"] as const).map((lane) => (
              <g
                key={lane}
                className={styles.pill}
                data-lane={lane}
                data-on={verdict === lane}
                transform={`translate(${PILL_X} ${lane === "allow" ? Y : LANE[lane]})`}
              >
                <rect x={-PILL_W / 2} y={-15} width={PILL_W} height={30} rx={15} />
                <text y={5}>{copy.lanes[lane]}</text>
              </g>
            ))}
            <g className={styles.stop} data-on={verdict === "deny" && arrived} transform={`translate(${STOP_X} ${LANE.deny})`}>
              <circle r="10" />
              <path d="M-6 6 L6 -6" />
            </g>
            {X.map((x, index) => (
              <circle
                key={x}
                ref={(node) => {
                  nodesRef.current[index] = node;
                }}
                cx={x}
                cy={Y}
                r={index === 3 ? 11 : 8}
                className={styles.node}
                data-gate={index === 3}
                data-reachable={reachable(index)}
              />
            ))}
            <g ref={tokenRef} className={styles.token} transform={`translate(${X[0]} ${Y})`}>
              <circle r="15" className={styles.tokenHalo} />
              <circle r="7" className={styles.tokenCore} />
            </g>
          </svg>

          <ol className={styles.stations}>
            {copy.stations.map((station, index) => (
              <li
                key={station.id}
                ref={(node) => {
                  stationsRef.current[index] = node;
                }}
                className={styles.station}
                data-reachable={reachable(index)}
                data-stop={verdict === "deny" && index === 3}
              >
                <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{station.title}</h3>
                <p>{station.text}</p>
              </li>
            ))}
          </ol>

          <div className={styles.outcome} key={scenarioId} data-arrived={arrived}>
            <p className={styles.outcomeAction}>{scenario.action}</p>
            <p className={styles.outcomeVerdict} data-verdict={verdict}>
              <strong>{copy.lanes[verdict]}</strong> · {scenario.verdictText}
            </p>
            <p className={styles.outcomeReceipt}>{scenario.receipt}</p>
          </div>
        </div>

        <div className={styles.lower}>
          <ul className={`card ${styles.verdicts}`}>
            {verdicts.map((item) => (
              <li key={item.id} data-tone={item.id} data-reveal>
                <span className={styles.verdictDot} aria-hidden />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className={`night ${styles.limits}`} data-reveal>
            <p className="kicker">{copy.hardLimitsTitle}</p>
            <ul>
              {copy.hardLimits.map((limit) => (
                <li key={limit}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M3.4 12.6 12.6 3.4" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  {limit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {access && (
          <div className={styles.access} data-reveal>
            <AccessModes copy={access} lanes={copy.lanes} />
          </div>
        )}
      </div>
    </Reveal>
  );
}
