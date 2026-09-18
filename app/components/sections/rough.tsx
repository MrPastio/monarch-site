import { Reveal } from "../motion/reveal";
import type { HomeCopy } from "../../content/types";

/**
 * The section most product sites do not have: what is not good yet.
 * Everything here is also enforced by the truth contract in content/claims.ts.
 */
export function Rough({ copy }: { copy: HomeCopy }) {
  return (
    <section className="section rough" id="rough">
      <div className="shell">
        <Reveal from="up">
          <p className="eyebrow">{copy.rough.eyebrow}</p>
          <h2 className="headline section-title">{copy.rough.title}</h2>
          <p className="lede">{copy.rough.lede}</p>
        </Reveal>

        <ul className="rough-list">
          {copy.rough.items.map((item, index) => (
            <Reveal as="li" key={item.claim} from="up" index={index} className="rough-item">
              <h3 className="rough-title">{item.title}</h3>
              <p className="body-muted">{item.detail}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
