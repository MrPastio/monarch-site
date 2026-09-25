import Link from "next/link";
import { MonarchMark, MonarchWordmark } from "@/components/brand/monarch-mark";
import type { Dict } from "@/content/dictionary";
import { localePath, type Locale } from "@/lib/i18n";
import styles from "./site-footer.module.css";

export function SiteFooter({ locale, footer }: { locale: Locale; footer: Dict["footer"] }) {
  return (
    <footer className={styles.footer}>
      <div className={`shell-wide ${styles.top}`}>
        <div className={styles.brand}>
          <Link href={localePath(locale)} className={styles.brandLink} aria-label="Monarch">
            <MonarchMark size={34} variant="light" />
            <MonarchWordmark height={15} className={styles.wordmark} />
          </Link>
          <p className={styles.tagline}>{footer.tagline}</p>
          <p className={styles.blurb}>{footer.blurb}</p>
        </div>
        <Link href={localePath(locale, "download")} className={`btn btn-primary btn-lg ${styles.cta}`}>
          {footer.cta}
        </Link>
      </div>

      <div className={`shell-wide ${styles.columns}`}>
        {footer.columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className={styles.columnTitle}>{column.title}</p>
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={localePath(locale, link.href)} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-label="GitHub">
          <p className={styles.columnTitle}>GitHub</p>
          <ul>
            {footer.external.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link} rel="noreferrer" target="_blank">
                  {link.label} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={`shell-wide ${styles.base}`}>
        <p className={styles.honesty}>{footer.honesty}</p>
        <p className={styles.rights}>{footer.rights}</p>
      </div>
    </footer>
  );
}
