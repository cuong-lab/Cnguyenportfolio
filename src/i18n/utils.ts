import vi from './vi.json';
import en from './en.json';
import { defaultLocale, isLocale, type Locale } from './config';

// Re-export so components can pull both the translator helpers and the Locale
// type from a single module ('../i18n/utils').
export type { Locale } from './config';

type Dict = Record<string, unknown>;
const dictionaries: Record<Locale, Dict> = { vi, en };

// Localized content field shape used across src/data — mirrors how a headless
// CMS (Sanity next) exposes an internationalized field, so mapping the JSON
// samples onto real CMS documents later is a 1:1 swap.
export type Localized<T = string> = Record<Locale, T>;

/**
 * Resolve the active locale from a URL. URL routing for `/en/` isn't wired up
 * yet, so this yields the default (vi) unless a locale path segment is already
 * present — reading the segment now means `/en/` routes light up for free when
 * that routing lands, without touching call sites.
 */
export function getLocale(url?: URL): Locale {
  const segment = url?.pathname.split('/').filter(Boolean)[0];
  return isLocale(segment) ? segment : defaultLocale;
}

function lookup(dict: Dict, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') return (node as Dict)[part];
    return undefined;
  }, dict);
}

/**
 * UI-string translator for chrome/labels held in vi.json / en.json.
 * Falls back to the default locale, then to the raw key, so a missing string
 * is visible in dev rather than rendering blank.
 */
export function useTranslations(locale: Locale = defaultLocale) {
  return function t(key: string): string {
    const value = lookup(dictionaries[locale], key) ?? lookup(dictionaries[defaultLocale], key);
    return typeof value === 'string' ? value : key;
  };
}

/** Pick the active-locale value out of a `{ vi, en }` content field. */
export function localize<T>(field: Localized<T>, locale: Locale = defaultLocale): T {
  return field[locale] ?? field[defaultLocale];
}
