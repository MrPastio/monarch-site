import Link from "next/link";
import { MonarchMark } from "@/components/brand/monarch-mark";
import type { Dict } from "@/content/dictionary";
import { localePath, type Locale } from "@/lib/i18n";
import styles from "./site-footer.module.css";

export function SiteFooter({ locale, footer }: { locale: Locale; footer: Dict["footer"] }) {
  return (
    <footer className={styles.footer}>
      <div className={`shell-wide ${styles.inner}`}>
        <div className={styles.lead}>
          <MonarchMark size={44} />
          <p className={`display ${styles.tagline}`}>{footer.tagline}</p>
        </div>
        <div className={styles.columns}>
          {footer.columns.map((column) => (
            <div key={column.title}>
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
            </div>
          ))}
          <div>
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
          </div>
        </div>
      </div>
      <div className={`shell-wide ${styles.base}`}>
        <p className={styles.honesty}>{footer.honesty}</p>
        <p className={styles.rights}>{footer.rights}</p>
      </div>
    </footer>
  );
}
