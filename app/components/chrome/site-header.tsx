"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MonarchMark, MonarchWordmark } from "@/components/brand/monarch-mark";
import type { Dict } from "@/content/dictionary";
import { locales, localeMeta, localePath, type Locale } from "@/lib/i18n";
import styles from "./site-header.module.css";

export function SiteHeader({
  locale,
  chrome,
  translated,
}: {
  locale: Locale;
  chrome: Dict["chrome"];
  translated: readonly Locale[];
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [overNight, setOverNight] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The bar takes the light of whatever it floats over: paper, or night.
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const line = 32;
      const nights = document.querySelectorAll<HTMLElement>(".night");
      let over = false;
      nights.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top <= line && rect.bottom >= line && rect.width > window.innerWidth * 0.8) over = true;
      });
      setOverNight(over);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen && !menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLangOpen(false);
        setMenuOpen(false);
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [langOpen, menuOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const rest = pathname.split("/").slice(2).join("/");
  const current = (href: string) => pathname === localePath(locale, href) || pathname.startsWith(`${localePath(locale, href)}/`);

  return (
    <header className={styles.header} data-scrolled={scrolled || menuOpen} data-menu={menuOpen} data-night={overNight && !menuOpen}>
      <div className={styles.bar}>
        <Link href={localePath(locale)} className={styles.brand} aria-label={chrome.home}>
          <MonarchMark size={26} variant={overNight && !menuOpen ? "dark" : "light"} />
          <MonarchWordmark height={13} className={styles.wordmark} />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {chrome.nav.map((item) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              className={styles.navLink}
              aria-current={current(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.lang} ref={langRef}>
            <button
              type="button"
              className={styles.langButton}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-label={chrome.language}
              onClick={() => setLangOpen((open) => !open)}
            >
              {localeMeta[locale].short}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={styles.langMenu} role="menu" data-open={langOpen}>
              {locales.map((code) => (
                <Link
                  key={code}
                  role="menuitem"
                  href={localePath(code, rest)}
                  onClick={() => setLangOpen(false)}
                  hrefLang={code}
                  className={styles.langItem}
                  aria-current={code === locale ? "true" : undefined}
                  tabIndex={langOpen ? 0 : -1}
                >
                  <span>{localeMeta[code].label}</span>
                  {!translated.includes(code) && <em>{chrome.pendingTranslation}</em>}
                </Link>
              ))}
            </div>
          </div>
          <Link href={localePath(locale, "download")} className={`btn btn-primary ${styles.cta}`}>
            {chrome.download}
          </Link>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? chrome.close : chrome.menu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={styles.sheet} data-open={menuOpen} inert={!menuOpen}>
        <nav aria-label="Mobile">
          {chrome.nav.map((item, index) => (
            <Link
              key={item.href}
              href={localePath(locale, item.href)}
              className={styles.sheetLink}
              onClick={() => setMenuOpen(false)}
              style={{ "--i": index } as React.CSSProperties}
              aria-current={current(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href={localePath(locale, "download")} className="btn btn-primary btn-lg">
          {chrome.download}
        </Link>
      </div>
    </header>
  );
}
