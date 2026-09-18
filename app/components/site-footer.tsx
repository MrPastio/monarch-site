import { localeNames, locales } from "../content/types";
import type { HomeCopy, Locale } from "../content/types";
import { translatedLocales } from "../content";

export function SiteFooter({ copy, lang }: { copy: HomeCopy; lang: Locale }) {
  return (
    <footer className="site-footer">
      <div className="shell shell-wide site-footer-grid">
        <div className="site-footer-brand">
          <span className="wordmark wordmark-footer">
            <span className="wordmark-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                <path d="M3 18V8l4.5 5L12 5l4.5 8L21 8v10z" />
              </svg>
            </span>
            Monarch
          </span>
          <p className="body-muted site-footer-tagline">{copy.footer.tagline}</p>
        </div>

        {copy.footer.columns.map((column) => (
          <nav key={column.title} className="site-footer-column" aria-label={column.title}>
            <h2 className="eyebrow">{column.title}</h2>
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                  >
                    {link.label}
                    {link.href.startsWith("http") ? " ↗" : ""}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav className="site-footer-column" aria-label={copy.footer.languageTitle}>
          <h2 className="eyebrow">{copy.footer.languageTitle}</h2>
          <ul>
            {locales.map((locale) => {
              const ready = translatedLocales.includes(locale);
              return (
                <li key={locale}>
                  {ready ? (
                    <a href={`/${locale}`} aria-current={locale === lang ? "page" : undefined}>
                      {localeNames[locale]}
                    </a>
                  ) : (
                    // Not linked until the copy is translated and reviewed.
                    <span className="site-footer-pending">
                      {localeNames[locale]}
                      <span className="site-footer-soon">скоро</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="shell shell-wide site-footer-bottom">
        <span>{copy.footer.rights}</span>
        <span className="site-footer-stage">{copy.footer.stage}</span>
      </div>
    </footer>
  );
}
