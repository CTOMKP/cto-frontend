"use client";

import type { AppCurrency, AppLanguage } from "@/lib/preferencesStore";
import { FALLBACK_USD_RATES, usePreferencesStore } from "@/lib/preferencesStore";

type FormatFiatOptions = {
  compact?: boolean;
};

function localeForLanguage(language: AppLanguage): string {
  const map: Record<AppLanguage, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    hi: "hi-IN",
  };
  return map[language] ?? "en-US";
}

export function convertUsd(
  usdAmount: number,
  currency: AppCurrency,
  usdRates: Record<string, number>,
): number {
  if (currency === "USD") return usdAmount;
  const rate = usdRates[currency] ?? FALLBACK_USD_RATES[currency];
  if (!rate || !Number.isFinite(rate)) return usdAmount;
  return usdAmount * rate;
}

export function formatFiatValue(
  usdAmount: number | null | undefined,
  options: FormatFiatOptions & {
    currency: AppCurrency;
    language: AppLanguage;
    usdRates: Record<string, number>;
  },
): string {
  if (usdAmount == null || !Number.isFinite(usdAmount)) return "—";
  const value = convertUsd(usdAmount, options.currency, options.usdRates);
  const locale = localeForLanguage(options.language);

  if (options.compact) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: options.currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  const maxFrac = value >= 1 ? 2 : value >= 0.0001 ? 4 : 6;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: options.currency,
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: value >= 1 ? 2 : 0,
  }).format(value);
}

/** Formats a USD amount in the user's selected fiat currency. */
export function formatFiat(
  usdAmount: number | null | undefined,
  options: FormatFiatOptions = {},
): string {
  const { currency, language, usdRates } = usePreferencesStore.getState();
  return formatFiatValue(usdAmount, { ...options, currency, language, usdRates });
}
