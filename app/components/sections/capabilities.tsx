import { MaturityScale } from "../maturity-scale";
import { Reveal } from "../motion/reveal";
import type { Capability, HomeCopy } from "../../content/types";

function CapabilityCard({
  item,
  copy,
  index,
}: {
  item: Capability;
  copy: HomeCopy;
  index: number;
}) {
  return (
    <Reveal as="article" from="up" index={index} className="cap-card card" weight="panel">
      <header className="cap-head">
        <h3 className={item.featured ? "subhead" : "cap-title"}>{item.title}</h3>
        <MaturityScale value={item.maturity} labels={copy.capabilities.maturityLabels} />
      </header>

      <p className="cap-outcome">{item.outcome}</p>
      <p className="body-muted cap-detail">{item.detail}</p>

      {/* The limit is part of the card, never behind a click. */}
      <p className="cap-limit">
        <span className="cap-limit-mark" aria-hidden="true" />
        {item.limit}
      </p>

      <footer className="cap-foot">
        <span className="cap-boundaries">
          {item.boundaries.map((boundary) => (
            <span key={boundary} className="boundary-chip" data-tone={boundary}>
              {copy.boundaryLabels[boundary]}
            </span>
          ))}
        </span>
        <a
          className="cap-source mono"
          href={item.source}
          target="_blank"
          rel="noreferrer noopener"
        >
          исходник ↗
        </a>
      </footer>
    </Reveal>
  );
}

export function Capabilities({ copy }: { copy: HomeCopy }) {
  const featured = copy.capabilities.items.filter((item) => item.featured);
  const rest = copy.capabilities.items.filter((item) => !item.featured);

  return (
    <section className="section section-sunk" id="capabilities">
      <div className="shell shell-wide">
        <Reveal from="up">
          <p className="eyebrow">{copy.capabilities.eyebrow}</p>
          <h2 className="headline section-title">{copy.capabilities.title}</h2>
          <p className="lede">{copy.capabilities.lede}</p>
        </Reveal>

        <div className="cap-grid cap-grid-featured">
          {featured.map((item, i) => (
            <CapabilityCard key={item.id} item={item} copy={copy} index={i} />
          ))}
        </div>

        <div className="cap-grid cap-grid-rest">
          {rest.map((item, i) => (
            <CapabilityCard key={item.id} item={item} copy={copy} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
