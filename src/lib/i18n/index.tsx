import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type DictKey, type Locale } from "./dictionary";

export type { DictKey, Locale };

const STORAGE_KEY = "joc.locale";

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  fmtNum: (n: number | string | null | undefined, digits?: number) => string;
  fmtDate: (d: string | Date | null | undefined, withTime?: boolean) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function translate(locale: Locale, key: DictKey, vars?: Record<string, string | number>) {
  let s = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const tag = locale === "ar" ? "ar-EG" : "en-US";
    return {
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      fmtNum: (n, digits = 2) => {
        const v = typeof n === "string" ? Number(n) : (n ?? 0);
        return new Intl.NumberFormat(tag, {
          minimumFractionDigits: 0,
          maximumFractionDigits: digits,
        }).format(Number.isFinite(v) ? v : 0);
      },
      fmtDate: (d, withTime = false) => {
        if (!d) return "—";
        const date = typeof d === "string" ? new Date(d) : d;
        return new Intl.DateTimeFormat(tag, {
          dateStyle: "medium",
          ...(withTime ? { timeStyle: "short" } : {}),
        }).format(date);
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
