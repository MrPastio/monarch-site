import type { ClaimId, Maturity } from "./claims";

export const locales = ["ru", "uk", "en", "bg"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
  bg: "Български",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Where a step or capability sits relative to the three access boundaries. */
export type Boundary = "device" | "network" | "system";

export type Fact = {
  claim: ClaimId;
  label: string;
  detail: string;
};

export type StoryStep = {
  id: string;
  ordinal: string;
  title: string;
  detail: string;
  /** Path in the application source that owns this step. */
  source: string;
  boundary: Boundary;
  /** Screenshot of the real 0.2.5 window for this step, once captured. */
  shot?: { src: string; alt: string; width: number; height: number };
};

export type Capability = {
  id: string;
  title: string;
  outcome: string;
  detail: string;
  /** The honest limit — always rendered, never hidden behind a click. */
  limit: string;
  maturity: Maturity;
  boundaries: Boundary[];
  featured?: boolean;
  source: string;
};

export type BoundaryInfo = {
  id: Boundary;
  title: string;
  stance: string;
  detail: string;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type RoughEdge = {
  title: string;
  detail: string;
  claim: ClaimId;
};

export type HomeCopy = {
  meta: { title: string; description: string };
  nav: { label: string; href: string }[];
  hero: {
    pill: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustPrefix: string;
  };
  facts: { eyebrow: string; items: Fact[] };
  story: { eyebrow: string; title: string; lede: string; steps: StoryStep[] };
  capabilities: {
    eyebrow: string;
    title: string;
    lede: string;
    items: Capability[];
    maturityLabels: Record<Maturity, string>;
  };
  boundaries: {
    eyebrow: string;
    title: string;
    lede: string;
    items: BoundaryInfo[];
  };
  rough: { eyebrow: string; title: string; lede: string; items: RoughEdge[] };
  next: {
    eyebrow: string;
    title: string;
    badge: string;
    lede: string;
    doing: string[];
    incomplete: string[];
  };
  download: {
    eyebrow: string;
    title: string;
    lede: string;
    steps: string[];
    fields: {
      file: string;
      size: string;
      channel: string;
      signature: string;
      hash: string;
      published: string;
    };
    copy: string;
    copied: string;
    cta: string;
    ctaSecondary: string;
    verified: string;
    unavailable: string;
    invalid: string;
  };
  faq: { eyebrow: string; title: string; items: FaqItem[] };
  footer: {
    tagline: string;
    columns: { title: string; links: { label: string; href: string }[] }[];
    languageTitle: string;
    rights: string;
    stage: string;
  };
  boundaryLabels: Record<Boundary, string>;
};
