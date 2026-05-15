export function parseAmount(amount: string | null | undefined): number {
  if (!amount) {
    return 0;
  }
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
}

/** Avoid float noise (e.g. 18000.899999999998) before API / display math. */
export function roundToDecimalPlaces(
  value: number,
  decimalPlaces: number
): number {
  if (!Number.isFinite(value)) {
    return value;
  }
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

/** Money fields: round to rupee paise (2 decimals). */
export function roundCurrencyAmount(value: number): number {
  return roundToDecimalPlaces(value, 2);
}
