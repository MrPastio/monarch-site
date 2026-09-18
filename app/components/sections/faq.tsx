import { Reveal } from "../motion/reveal";
import type { HomeCopy } from "../../content/types";

/**
 * Native <details> so the answers exist for search engines and for
 * keyboard users without any JavaScript. The disclosure animation is
 * owned by CSS (::details-content), not by a second animation layer.
 */
export function Faq({ copy }: { copy: HomeCopy }) {
  return (
    <section className="section faq" id="faq">
      <div className="shell">
        <Reveal from="up">
          <p className="eyebrow">{copy.faq.eyebrow}</p>
          <h2 className="headline section-title">{copy.faq.title}</h2>
        </Reveal>

        <div className="faq-list">
          {copy.faq.items.map((item, index) => (
            <Reveal key={item.q} from="up" index={index} weight="control">
              <details className="faq-item" name="monarch-faq">
                <summary className="faq-question">
                  <span>{item.q}</span>
                  <span className="faq-sign" aria-hidden="true" />
                </summary>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
