"use client";

import Link from "next/link";
import { Marked, useLit } from "@/components/motion/marked";
import styles from "./page-hero.module.css";

/**
 * Opening of an inner page: a way back home, the title (with `*marks*`),
 * one line of context, optional jump links to the page's own sections and an
 * optional piece of art on the right.
 */
export function PageHero({
  kicker,
  title,
  lede,
  home,
  homeLabel = "Monarch",
  jumps,
  jumpsLabel,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  home?: string;
  homeLabel?: string;
  jumps?: readonly { href: string; label: string }[];
  jumpsLabel?: string;
  children?: React.ReactNode;
}) {
  const { ref, unlit } = useLit<HTMLDivElement>();
  return (
    <section className={styles.hero}>
      <div className={`shell ${styles.inner}`} data-has-art={Boolean(children)}>
        <div ref={ref} className={styles.copy} data-unlit={unlit}>
          <p className={styles.crumbs}>
            {home ? (
              <Link href={home} className={styles.crumbHome}>
                {homeLabel}
              </Link>
            ) : (
              <span>{homeLabel}</span>
            )}
            <span aria-hidden>/</span>
            <span className={styles.crumbHere}>{kicker}</span>
          </p>
          <h1 className={`display ${styles.title}`}>
            <Marked text={title} />
          </h1>
          <p className={`lede ${styles.lede}`}>{lede}</p>
          {jumps && jumps.length > 0 && (
            <nav className={styles.jumps} aria-label={jumpsLabel}>
              {jumps.map((jump) => (
                <a key={jump.href} href={jump.href} className={styles.jump}>
                  {jump.label}
                  <span aria-hidden>↓</span>
                </a>
              ))}
            </nav>
          )}
        </div>
        {children && <div className={styles.art}>{children}</div>}
      </div>
    </section>
  );
}
