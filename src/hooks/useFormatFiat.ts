"use client";

import { useCallback } from "react";
import { formatFiatValue } from "@/lib/formatFiat";
import { usePreferencesStore } from "@/lib/preferencesStore";

export function useFormatFiat() {
  const currency = usePreferencesStore((s) => s.currency);
  const language = usePreferencesStore((s) => s.language);
  const usdRates = usePreferencesStore((s) => s.usdRates);

  return useCallback(
    (usdAmount: number | null | undefined, options?: { compact?: boolean }) =>
      formatFiatValue(usdAmount, {
        compact: options?.compact,
        currency,
        language,
        usdRates,
      }),
    [currency, language, usdRates],
  );
}
