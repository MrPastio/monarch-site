import type { Locale } from "@/lib/i18n";
import { ru } from "./ru";
import { uk } from "./uk";
import { en } from "./en";
import { bg } from "./bg";

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

/** Russian is the reference; every other locale must fill the same shape. */
const dictionaries: Record<Locale, Dict> = { ru, uk, en, bg };

export const translatedLocales: readonly Locale[] = ["ru", "uk", "en", "bg"];

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
