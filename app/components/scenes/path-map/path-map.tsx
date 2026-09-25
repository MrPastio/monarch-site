"use client";

import { useState } from "react";
import type { Dict } from "@/content/dictionary";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { useLit } from "@/components/motion/marked";
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

const paths: Record<Verdict, string> = {
  allow: `M${X[0]} ${Y} H${X[6]}`,
  confirm: `M${X[0]} ${Y} H${X[3]} C ${X[3] + 50} ${Y}, ${X[3] + 30} ${LANE.confirm}, ${X[3] + 80} ${LANE.confirm} H${X[3] + 104} C ${X[3] + 154} ${LANE.confirm}, ${X[4] - 40} ${Y}, ${X[4] + 10} ${Y} H${X[6]}`,
  deny: `M${X[0]} ${Y} H${X[3]} C ${X[3] + 50} ${Y}, ${X[3] + 30} ${LANE.deny}, ${X[3] + 80} ${LANE.deny} H${PILL_X + PILL_W / 2 + 17}`,
};

/**
 * The request path as a line you can follow: seven stations, and one fork —
 * the policy gate — where the request goes on, waits for you, or stops.
 */
export function PathMap({ copy, verdicts }: { copy: Copy; verdicts: Dict["pages"]["security"]["verdicts"] }) {
  const [scenarioId, setScenarioId] = useState(copy.scenarios[0]!.id);
  const scenario = copy.scenarios.find((item) => item.id === scenarioId)!;
  const verdict = scenario.verdict as Verdict;
  const { ref, unlit } = useLit<HTMLDivElement>();

  const stationState = (index: number) => {
    if (verdict === "deny" && index > 3) return "off";
    if (verdict === "deny" && index === 3) return "stop";
    return "on";
  };

  return (
    <Reveal as="section" className={styles.section} labelledBy="route-title" id="route">
      <div className="shell">
        <ChapterHead id="route-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} align="center" />

        <div className={styles.tabs} role="tablist" aria-label={copy.choose} data-reveal>
          {copy.scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === scenarioId}
              className={styles.tab}
              data-verdict={item.verdict}
              onClick={() => setScenarioId(item.id)}
            >
              <span className={styles.tabDot} aria-hidden />
              {item.prompt}
            </button>
          ))}
        </div>

        <div ref={ref} className={`card ${styles.board}`} data-verdict={verdict} data-unlit={unlit} data-reveal>
          <svg className={styles.map} viewBox="0 0 1200 150" aria-hidden>
            {/* all lanes, quiet */}
            <path d={paths.allow} className={styles.base} />
            <path d={paths.confirm} className={styles.base} />
            <path d={paths.deny} className={styles.base} />
            {/* the chosen request, drawn left to right */}
            <path key={scenarioId} d={paths[verdict]} className={styles.live} pathLength={1} />
            {(["confirm", "allow", "deny"] as const).map((lane) => (
              <g key={lane} className={styles.pill} data-lane={lane} data-on={verdict === lane} transform={`translate(${PILL_X} ${lane === "allow" ? Y : LANE[lane]})`}>
                <rect x={-PILL_W / 2} y={-15} width={PILL_W} height={30} rx={15} />
                <text y={5}>{copy.lanes[lane]}</text>
              </g>
            ))}
            <g className={styles.stop} data-on={verdict === "deny"} transform={`translate(${PILL_X + PILL_W / 2 + 26} ${LANE.deny})`}>
              <circle r="9" />
              <path d="M-6 6 L6 -6" />
            </g>
            {X.map((x, index) => (
              <circle
                key={x}
                cx={x}
                cy={Y}
                r={index === 3 ? 11 : 8}
                className={styles.node}
                data-state={stationState(index)}
                style={{ "--i": index } as React.CSSProperties}
              />
            ))}
          </svg>

          <ol className={styles.stations}>
            {copy.stations.map((station, index) => (
              <li key={station.id} className={styles.station} data-state={stationState(index)}>
                <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{station.title}</h3>
                <p>{station.text}</p>
              </li>
            ))}
          </ol>

          <div className={styles.outcome} key={scenarioId}>
            <p className={styles.outcomeAction}>
              <span className="mono">{scenario.action}</span>
            </p>
            <p className={styles.outcomeVerdict} data-verdict={verdict}>
              <strong>{copy.lanes[verdict]}</strong> · {scenario.verdictText}
            </p>
            <p className={styles.outcomeReceipt}>{scenario.receipt}</p>
          </div>
        </div>

        <div className={styles.lower}>
          <ul className={styles.verdicts}>
            {verdicts.map((item) => (
              <li key={item.id} className="card" data-tone={item.id} data-reveal>
                <span className={styles.verdictDot} aria-hidden />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
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
      </div>
    </Reveal>
  );
}
