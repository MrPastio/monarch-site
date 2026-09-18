import { ru } from "./ru";
import type { HomeCopy, Locale } from "./types";

/**
 * Locale dictionaries. The shape is typed for all four locales from day one;
 * uk / en / bg fall back to Russian until a human translation is reviewed —
 * machine-translating a truth contract is how a site starts lying.
 */
const dictionaries: Record<Locale, HomeCopy> = {
  ru,
  uk: ru,
  en: ru,
  bg: ru,
};

/** Locales whose copy has actually been written and reviewed. */
export const translatedLocales: Locale[] = ["ru"];

export function getCopy(locale: Locale): HomeCopy {
  return dictionaries[locale];
}
