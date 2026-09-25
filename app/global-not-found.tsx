import "@fontsource-variable/onest/index.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./styles/base.css";

import type { Metadata } from "next";
import { MonarchMark, MonarchWordmark } from "@/components/brand/monarch-mark";
import { NotFoundView } from "@/components/page/not-found-view";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "404 — Monarch",
  robots: { index: false },
};

/** Unmatched addresses anywhere on the site land here, outside the locale layout. */
export default function GlobalNotFound() {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <header style={{ position: "fixed", inset: "0 0 auto", zIndex: 50, display: "flex", alignItems: "center", height: "var(--header-h)", padding: "0 var(--gutter)" }}>
          {/* A plain link: the root only picks a language, it has no page to prefetch. */}
          <a href={asset("/")} style={{ display: "inline-flex", alignItems: "center", gap: 10 }} aria-label="Monarch">
            <MonarchMark size={26} variant="light" />
            <MonarchWordmark height={13} className="gnf-wordmark" />
          </a>
        </header>
        <main>
          <NotFoundView />
        </main>
      </body>
    </html>
  );
}
