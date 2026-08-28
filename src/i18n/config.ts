"use client";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { i18nResources } from "@/i18n/resources";
import { LANGUAGE_STORAGE_KEY, readStoredLanguage } from "@/lib/preferencesStore";

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: i18nResources,
      lng: typeof window === "undefined" ? "en" : readStoredLanguage(),
      fallbackLng: "en",
      supportedLngs: Object.keys(i18nResources),
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage"],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: ["localStorage"],
      },
    });
}

export default i18n;
