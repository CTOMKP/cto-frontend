"use client";

import { useEffect, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import i18n from "@/i18n/config";
import {
  APP_CURRENCIES,
  hydratePreferences,
  usePreferencesStore,
} from "@/lib/preferencesStore";

async function fetchUsdRates(signal?: AbortSignal): Promise<Record<string, number>> {
  const codes = APP_CURRENCIES.map((c) => c.code).filter((code) => code !== "USD");
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${codes.join(",")}`,
    { signal },
  );
  if (!res.ok) throw new Error("Failed to load exchange rates");
  const body = (await res.json()) as { rates?: Record<string, number> };
  return body.rates ?? {};
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const language = usePreferencesStore((s) => s.language);
  const setUsdRates = usePreferencesStore((s) => s.setUsdRates);

  useEffect(() => {
    hydratePreferences();
  }, []);

  const ratesQuery = useQuery({
    queryKey: ["fx-rates", "USD"],
    queryFn: ({ signal }) => fetchUsdRates(signal),
    staleTime: 60 * 60_000,
    gcTime: 6 * 60 * 60_000,
    retry: 2,
  });

  useEffect(() => {
    if (ratesQuery.data) setUsdRates(ratesQuery.data);
  }, [ratesQuery.data, setUsdRates]);

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
