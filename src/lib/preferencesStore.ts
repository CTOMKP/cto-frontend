"use client";

import { create } from "zustand";

export const APP_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
] as const;

export const APP_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
  { code: "KRW", name: "South Korean Won" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "ZAR", name: "South African Rand" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "THB", name: "Thai Baht" },
  { code: "IDR", name: "Indonesian Rupiah" },
] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number]["code"];
export type AppCurrency = (typeof APP_CURRENCIES)[number]["code"];

export const LANGUAGE_STORAGE_KEY = "cto_language";
export const CURRENCY_STORAGE_KEY = "cto_currency";

/** Approximate USD rates so the picker works before live FX loads. */
export const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.86,
  GBP: 0.74,
  JPY: 147,
  CNY: 7.2,
  INR: 83,
  KRW: 1350,
  CAD: 1.37,
  AUD: 1.52,
  CHF: 0.8,
  HKD: 7.8,
  SGD: 1.28,
  NZD: 1.65,
  BRL: 5.4,
  MXN: 18.5,
  ZAR: 18.2,
  TRY: 34,
  SEK: 10.4,
  NOK: 10.5,
  PLN: 3.9,
  PHP: 56,
  THB: 34,
  IDR: 15800,
};

function isAppLanguage(value: string | null): value is AppLanguage {
  return APP_LANGUAGES.some((l) => l.code === value);
}

function isAppCurrency(value: string | null): value is AppCurrency {
  return APP_CURRENCIES.some((c) => c.code === value);
}

export function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isAppLanguage(stored) ? stored : "en";
}

export function readStoredCurrency(): AppCurrency {
  if (typeof window === "undefined") return "USD";
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return isAppCurrency(stored) ? stored : "USD";
}

type PreferencesState = {
  language: AppLanguage;
  currency: AppCurrency;
  usdRates: Record<string, number>;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: AppCurrency) => void;
  setUsdRates: (usdRates: Record<string, number>) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  language: "en",
  currency: "USD",
  usdRates: FALLBACK_USD_RATES,
  setLanguage: (language) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
    set({ language });
  },
  setCurrency: (currency) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
    set({ currency });
  },
  setUsdRates: (usdRates) => set({ usdRates: { ...FALLBACK_USD_RATES, ...usdRates } }),
}));

export function hydratePreferences() {
  usePreferencesStore.setState({
    language: readStoredLanguage(),
    currency: readStoredCurrency(),
  });
}

export function getLanguageMeta(code: string) {
  return APP_LANGUAGES.find((l) => l.code === code) ?? APP_LANGUAGES[0];
}

export function getCurrencyMeta(code: string) {
  return APP_CURRENCIES.find((c) => c.code === code) ?? APP_CURRENCIES[0];
}
