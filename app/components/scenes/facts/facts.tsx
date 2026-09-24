import type { Dict } from "@/content/dictionary";
import facts from "@/content/facts.snapshot.json";
import { ChapterHead } from "@/components/scenes/chapter";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "./count-up";
import styles from "./facts.module.css";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#ffb52b",
  Python: "#f3efe6",
  JavaScript: "#ff7a18",
  CSS: "#ffe28a",
  "C#": "#9aa0a8",
  HTML: "#c98a1b",
  PowerShell: "#5d636c",
};

export function Facts({ copy, locale }: { copy: Dict["facts"]; locale: string }) {
  const total = facts.languages.reduce((sum, item) => sum + item.bytes, 0);
  const numbers = [
    { value: facts.files, label: copy.items.files },
    { value: facts.testFiles, label: copy.items.tests },
    { value: facts.modules, label: copy.items.modules },
    { value: facts.installerReleases, label: copy.items.releases },
    { value: 5, label: copy.items.processes },
    { value: 0, label: copy.items.trackers },
  ];

  return (
    <Reveal as="section" className={styles.section} labelledBy="facts-title">
      <div className="shell">
        <ChapterHead id="facts-title" index={copy.index} kicker={copy.kicker} title={copy.title} lede={copy.lede} />

        <dl className={styles.numbers}>
          {numbers.map((item) => (
            <div key={item.label} className={styles.number} data-reveal>
              <dt>
                <CountUp value={item.value} locale={locale} />
              </dt>
              <dd>{item.label}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.languages} data-reveal>
          <p className={styles.subTitle}>{copy.languagesTitle}</p>
          <div className={styles.bar} role="img" aria-label={facts.languages.map((item) => `${item.name} ${Math.round((item.bytes / total) * 100)}%`).join(", ")}>
            {facts.languages.map((item, index) => (
              <span
                key={item.name}
                style={{ flexGrow: item.bytes, background: LANGUAGE_COLORS[item.name], "--i": index } as React.CSSProperties}
              />
            ))}
          </div>
          <ul className={styles.legend}>
            {facts.languages.map((item) => (
              <li key={item.name}>
                <i style={{ background: LANGUAGE_COLORS[item.name] }} />
                {item.name}
                <span>{((item.bytes / total) * 100).toLocaleString(locale, { maximumFractionDigits: 1 })}%</span>
              </li>
            ))}
          </ul>
          <p className={styles.source}>{copy.source}</p>
        </div>

        <div className={styles.timeline} data-reveal>
          <p className={styles.subTitle}>{copy.timelineTitle}</p>
          <ol>
            {copy.timeline.map((item, index) => (
              <li key={item.title} data-last={index === copy.timeline.length - 1}>
                <span className={styles.tlDot} aria-hidden />
                <p className={styles.tlDate}>{item.date}</p>
                <p className={styles.tlTitle}>{item.title}</p>
                <p className={styles.tlText}>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Reveal>
  );
}
