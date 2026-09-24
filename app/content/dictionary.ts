import type { Locale } from "@/lib/i18n";
import { ru } from "./ru";

/** Turns the literal Russian reference into the shape every locale must fill. */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { readonly [K in keyof T]: Widen<T[K]> }
          : T;

export type Dict = Widen<typeof ru>;

/**
 * Russian is the reference. The other three locales are filled in only after
 * the Russian copy is approved; until then they read the reference so a page
 * never renders half-translated.
 */
const dictionaries: Record<Locale, Dict> = {
  ru,
  uk: ru,
  en: ru,
  bg: ru,
};

export const translatedLocales: readonly Locale[] = ["ru"];

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
