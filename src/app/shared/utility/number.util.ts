export function parseAmount(amount: string | null | undefined): number {
  if (!amount) {
    return 0;
  }
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
}
