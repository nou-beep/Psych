// Lightweight i18n core for Eyla — namespaced key lookup with simple
// variable interpolation, no runtime dep. Dictionaries live in
// lib/i18n/dictionaries/* and are typed via the EN dictionary as the
// canonical shape, so FR is guaranteed structurally identical.
//
// Design choices
// - Locale is "en" | "fr". Default = "fr" because Eyla's primary
//   author is francophone and the academic content is French.
// - Keys are namespaced strings like "auth.login.title".
// - Missing keys fall back to the EN entry, then to the key itself.
// - Variable interpolation: t("X", { name: "Y" }) replaces {name}.
// - No pluralization syntax in v1; for plurals callers can switch
//   keys explicitly (t("inbox.empty") vs t("inbox.count", { n })).

import { EN_DICT } from "./dictionaries/en";
import { FR_DICT } from "./dictionaries/fr";
import { AR_DICT } from "./dictionaries/ar";

/**
 * Supported UI locales.
 *
 * - "fr" — default, fully translated, academic French.
 * - "en" — fully translated, US English.
 * - "ar" — scaffold only. The Arabic dictionary currently mirrors
 *   the French content as a starting point; toggle exposure is
 *   gated behind `EXPOSED_LOCALES` until proper translations land.
 *
 * Adding a new locale is two steps: add it to `LOCALES`, add a
 * dictionary file to `dictionaries/<code>.ts`. The translator
 * fallback chain already handles missing keys.
 */
export type Locale = "en" | "fr" | "ar";
export const LOCALES: readonly Locale[] = ["en", "fr", "ar"] as const;

/**
 * Subset of `LOCALES` that the LanguageToggle UI shows to users.
 * Scaffolded locales stay accessible programmatically (the URL,
 * settings, tests) but don't surface in the toggle until ready.
 */
export const EXPOSED_LOCALES: readonly Locale[] = ["en", "fr"] as const;

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_STORAGE_KEY = "eyla-locale-v1";

export type Dictionary = typeof EN_DICT;

const DICTS: Record<Locale, Dictionary> = {
  en: EN_DICT,
  fr: FR_DICT,
  ar: AR_DICT,
};

export function isValidLocale(value: unknown): value is Locale {
  return value === "en" || value === "fr" || value === "ar";
}

export function readLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isValidLocale(v)) return v;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

export function writeLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

// Recursively walks the dictionary tree by dot-separated key.
function lookup(
  dict: Record<string, unknown>,
  key: string
): string | undefined {
  const parts = key.split(".");
  let cursor: unknown = dict;
  for (const part of parts) {
    if (cursor && typeof cursor === "object" && part in (cursor as object)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cursor === "string" ? cursor : undefined;
}

function interpolate(
  template: string,
  vars: Record<string, string | number> | undefined
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`
  );
}

/**
 * Translate a namespaced key. Fallback chain:
 * - active locale →
 * - "fr" if active is "ar" (Maghreb context) →
 * - "en" universal fallback →
 * - the key itself so missing entries are visible to developers.
 */
export function t(
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>
): string {
  const direct = lookup(DICTS[locale] as Record<string, unknown>, key);
  if (direct !== undefined) return interpolate(direct, vars);

  if (locale === "ar") {
    const frFallback = lookup(
      DICTS.fr as Record<string, unknown>,
      key
    );
    if (frFallback !== undefined) return interpolate(frFallback, vars);
  }

  if (locale !== "en") {
    const enFallback = lookup(
      DICTS.en as Record<string, unknown>,
      key
    );
    if (enFallback !== undefined) return interpolate(enFallback, vars);
  }

  return interpolate(key, vars);
}

/**
 * Returns the dictionary object for a locale — useful for components
 * that want to read a whole namespace at once instead of calling t()
 * many times.
 */
export function dictFor(locale: Locale): Dictionary {
  return DICTS[locale];
}

// ─── Locale-aware formatting helpers ──────────────────────────

const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-MA",
};

export function formatDate(
  date: Date | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], options).format(d);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], options).format(value);
}

export function formatRelative(
  date: Date | string,
  locale: Locale,
  base: Date = new Date()
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  const diffMs = d.getTime() - base.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAG[locale], {
    numeric: "auto",
  });
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  const diffYear = Math.round(diffMonth / 12);
  return rtf.format(diffYear, "year");
}
