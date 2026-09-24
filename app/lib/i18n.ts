export const locales = ["ru", "uk", "en", "bg"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeMeta: Record<
  Locale,
  { label: string; short: string; intl: string; og: string }
> = {
  ru: { label: "Русский", short: "RU", intl: "ru-RU", og: "ru_RU" },
  uk: { label: "Українська", short: "UK", intl: "uk-UA", og: "uk_UA" },
  en: { label: "English", short: "EN", intl: "en-US", og: "en_US" },
  bg: { label: "Български", short: "BG", intl: "bg-BG", og: "bg_BG" },
};

/**
 * Picks the best supported locale from an Accept-Language header.
 * Belarusian and Kazakh visitors read Russian more often than English.
 */
export function negotiateLocale(header: string | null): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0] ?? "";
    if (isLocale(base)) return base;
    if (base === "be" || base === "kk") return "ru";
  }
  return ranked.some(({ tag }) => tag.startsWith("en")) ? "en" : defaultLocale;
}

export function localePath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}
