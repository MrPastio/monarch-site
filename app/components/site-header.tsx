"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { spring } from "./motion/springs";
import type { HomeCopy } from "../content/types";

type Theme = "light" | "dark" | "system";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("monarch-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode or blocked storage — system is a fine answer */
  }
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
  try {
    if (theme === "system") localStorage.removeItem("monarch-theme");
    else localStorage.setItem("monarch-theme", theme);
  } catch {
    /* the page still works without a remembered choice */
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  // Cycle system → light → dark → system: three honest states, one control.
  const next: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
  const label: Record<Theme, string> = {
    system: "Тема: как в системе",
    light: "Тема: светлая",
    dark: "Тема: тёмная",
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={mounted ? label[theme] : "Переключить тему"}
      title={mounted ? label[theme] : undefined}
      onClick={() => {
        const value = next[theme];
        setTheme(value);
        applyTheme(value);
      }}
    >
      <span aria-hidden="true" className="theme-toggle-glyph" data-theme-state={mounted ? theme : "system"}>
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="4" />
          <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4M15.9 15.9l-1.4-1.4M5.5 5.5L4.1 4.1" />
        </svg>
      </span>
    </button>
  );
}

export function SiteHeader({ copy }: { copy: HomeCopy }) {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [lifted, setLifted] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    // Single owner for this state; hysteresis keeps it from flickering.
    setLifted((current) => (current ? value > 24 : value > 64));
  });

  return (
    <motion.header
      className="site-header"
      data-lifted={lifted || undefined}
      initial={false}
      animate={{ y: 0 }}
      transition={reduced ? { duration: 0 } : spring.control}
    >
      <div className="shell shell-wide site-header-inner">
        <a className="wordmark" href="#top">
          <span className="wordmark-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M3 18V8l4.5 5L12 5l4.5 8L21 8v10z" />
            </svg>
          </span>
          Monarch
        </a>

        <nav className="site-nav" aria-label="Разделы страницы">
          {copy.nav.map((item) => (
            <a key={item.href} href={item.href} className="site-nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header-actions">
          <ThemeToggle />
          <a className="btn btn-primary btn-header" href="#download">
            {copy.hero.ctaPrimary}
          </a>
        </div>
      </div>
    </motion.header>
  );
}
