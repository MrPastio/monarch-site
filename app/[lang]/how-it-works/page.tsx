import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/content/dictionary";
import { isLocale, localePath } from "@/lib/i18n";
import { PageHero } from "@/components/page/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { ArchitectureMap } from "@/components/page/architecture-map";
import { ModuleGrid } from "@/components/page/module-grid";
import { PathMap } from "@/components/scenes/path-map/path-map";
import styles from "../prose.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = getDict(lang).pages.how;
  return { title: copy.title, description: copy.lede, alternates: { canonical: `/${lang}/how-it-works` } };
}

export default async function HowPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  const copy = dict.pages.how;
  const models = dict.hardware.picker.models;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lede={copy.lede} home={localePath(lang)} jumps={copy.jumps} jumpsLabel={dict.ui.jumpsLabel} />

      <Reveal as="section" className={styles.section} id="processes">
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.processTitle}
          </h2>
          <div className={styles.block} data-reveal>
            <ArchitectureMap copy={copy} />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section}>
        <div className={`shell ${styles.split}`}>
          <div data-reveal>
            <h2 className={styles.h2}>{copy.kernelTitle}</h2>
          </div>
          <div data-reveal>
            <p className={styles.bigText}>{copy.kernelText}</p>
            <ol className={styles.flow}>
              {copy.kernelFlow.map((step, index) => (
                <li key={step} style={{ "--i": index } as React.CSSProperties}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>

      <PathMap copy={dict.journey} verdicts={dict.pages.security.verdicts} indexed={false} />

      <Reveal as="section" className={styles.section} id="modules">
        <div className="shell">
          <h2 className={styles.h2} data-reveal>
            {copy.modulesTitle}
          </h2>
          <div data-reveal>
            <ModuleGrid copy={copy} />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.section} id="models">
        <div className={`shell ${styles.twoCol}`}>
          <article className={`card ${styles.feature}`} data-reveal>
            <h2 className={styles.h3}>{copy.modelsTitle}</h2>
            <p className={styles.text}>{copy.modelsText}</p>
            <ul className={styles.modelList}>
              {models.map((model) => (
                <li key={model.name}>
                  <strong>
                    {model.name}
                    {model.beta && <em>Beta</em>}
                  </strong>
                  <span>{model.note}</span>
                  <span className={styles.modelRam}>
                    {model.ram} {dict.hardware.picker.unit}
                  </span>
                </li>
              ))}
            </ul>
            <Link className={`btn btn-glass ${styles.cta}`} href={localePath(lang, "documentation")}>
              {dict.chrome.nav[4]!.label} →
            </Link>
          </article>
          <article className={`card ${styles.feature}`} data-reveal>
            <h2 className={styles.h3}>{copy.memoryTitle}</h2>
            <p className={styles.text}>{copy.memoryText}</p>
            <div className={styles.memorySplit} aria-hidden>
              <span>{dict.abilities.vignettes.memoryChats}</span>
              <i />
              <span>{dict.abilities.vignettes.memoryProject}</span>
            </div>
          </article>
        </div>
      </Reveal>
    </>
  );
}
