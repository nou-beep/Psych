"use client";
// LocaleContext — provides the active locale to every consumer, a
// setter that persists to localStorage, and a `useT()` hook that
// returns a curried `t(key, vars?)` bound to the active locale.
//
// Hydration safety: the provider boots with the SSR-safe default
// locale so the first render matches what the server emitted, then
// reads the persisted choice in a useEffect and updates state. The
// document-language attribute is kept in sync so screen readers and
// the browser surface the right language.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  formatDate,
  formatNumber,
  formatRelative,
  readLocale,
  t as tFn,
  writeLocale,
  type Locale,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  ready: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatDate: (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatRelative: (date: Date | string, base?: Date) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readLocale();
    setLocaleState(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined" && ready) {
      document.documentElement.lang = locale;
    }
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      ready,
      t: (key, vars) => tFn(key, locale, vars),
      formatDate: (date, options) => formatDate(date, locale, options),
      formatNumber: (n, options) => formatNumber(n, locale, options),
      formatRelative: (date, base) => formatRelative(date, locale, base),
    }),
    [locale, setLocale, ready]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

/**
 * Tiny ergonomic alias when you only need the translator.
 * Usage: `const t = useT(); <span>{t("auth.login.title")}</span>`
 */
export function useT(): (
  key: string,
  vars?: Record<string, string | number>
) => string {
  return useLocale().t;
}
