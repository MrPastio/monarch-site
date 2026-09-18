import { Reveal } from "../motion/reveal";
import { claims } from "../../content/claims";
import type { HomeCopy } from "../../content/types";

const sourceUrl = (path: string) =>
  path.startsWith("http")
    ? path
    : `https://github.com/MrPastio/monarch/blob/main/${path}`;

/** Four verifiable facts, each pointing at the code that backs it. */
export function Facts({ copy }: { copy: HomeCopy }) {
  return (
    <section className="facts" aria-label={copy.facts.eyebrow}>
      <div className="shell shell-wide">
        <ul className="facts-grid">
          {copy.facts.items.map((fact, index) => (
            <Reveal as="li" key={fact.claim} from="up" index={index} className="fact" weight="control">
              <h3 className="fact-label">{fact.label}</h3>
              <p className="fact-detail">{fact.detail}</p>
              <a
                className="fact-source mono"
                href={sourceUrl(claims[fact.claim].evidence)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {claims[fact.claim].evidence} ↗
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
