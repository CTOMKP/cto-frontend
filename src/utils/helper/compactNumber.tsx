export function compactNumber(value: number, decimals = 1): string {
  if (!isFinite(value)) return 'NaN';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  const format = (num: number, suffix: string) => {
    const fixed = num.toFixed(decimals);
    // Remove trailing ".0" if decimals = 1 and number is whole
    return fixed.endsWith('.0') ? `${sign}${fixed.slice(0, -2)}${suffix}` : `${sign}${fixed}${suffix}`;
  };

  if (abs >= 1e12) return format(abs / 1e12, 'T');
  if (abs >= 1e9) return format(abs / 1e9, 'B');
  if (abs >= 1e6) return format(abs / 1e6, 'M');
  if (abs >= 1e3) return format(abs / 1e3, 'k');

  return `${value}`;
}