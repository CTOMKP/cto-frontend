"use client";

import { useFormatFiat } from "@/hooks/useFormatFiat";

/** Renders a USD amount in the user's selected fiat currency. */
export default function FiatText({
  usd,
  compact = true,
  className,
}: {
  usd: number | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  const formatFiat = useFormatFiat();
  return <span className={className}>{formatFiat(usd, { compact })}</span>;
}
