import en from './dictionaries/en.json';
import ms from './dictionaries/ms.json';
import type { Locale } from '../domain/types';

export const LOCALE_COOKIE = 'taptap_locale';
export const LOCALES: Locale[] = ['en', 'ms'];
export const DEFAULT_LOCALE: Locale = 'en';

const dictionaries = { en, ms } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

type Path<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: Path<T[K], `${Prefix}${Prefix extends '' ? '' : '.'}${K}`>;
    }[keyof T & string];

export type TranslationKey = Path<Dictionary>;

/** Dotted-path lookup, e.g. t(dict, 'nav.dashboard'). Falls back to the key itself if missing. */
export function translate(dict: Dictionary, key: TranslationKey): string {
  const parts = (key as string).split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = dict;
  for (const part of parts) {
    node = node?.[part];
    if (node == null) return key as string;
  }
  return typeof node === 'string' ? node : (key as string);
}
