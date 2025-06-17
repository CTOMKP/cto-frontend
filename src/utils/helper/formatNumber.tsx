export function formatNumber(
  value: number,
  options?: {
    decimalsAboveOne?: number;
    decimalsBelowOne?: number;
    minThreshold?: number;
  }
): string {
  const {
    decimalsAboveOne = 2,
    decimalsBelowOne = 6,
    minThreshold = 0.000001,
  } = options || {};

  if (!isFinite(value)) return 'NaN';

  if (value === 0) return '0';

  if (value < minThreshold && value > 0) {
    return `${minThreshold}<`;
  }

  if (value >= 1) {
    return value.toFixed(decimalsAboveOne);
  }

  return value.toFixed(decimalsBelowOne);
}
