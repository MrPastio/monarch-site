import { Reveal } from "../motion/reveal";
import type { HomeCopy } from "../../content/types";

/** What is being built. Marked "not released" and given no dates. */
export function NextUp({ copy }: { copy: HomeCopy }) {
  return (
    <section className="section section-sunk next-up" id="next">
      <div className="shell">
        <Reveal from="up">
          <p className="eyebrow">{copy.next.eyebrow}</p>
          <div className="next-head">
            <h2 className="headline">{copy.next.title}</h2>
            <span className="next-badge">{copy.next.badge}</span>
          </div>
          <p className="lede">{copy.next.lede}</p>
        </Reveal>

        <div className="next-grid">
          <Reveal from="up" index={1} className="next-column card">
            <h3 className="next-column-title">Что уже делаем</h3>
            <ul className="next-items">
              {copy.next.doing.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal from="up" index={2} className="next-column card" weight="panel">
            <h3 className="next-column-title">Что ещё не закончено</h3>
            <ul className="next-items next-items-open">
              {copy.next.incomplete.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
