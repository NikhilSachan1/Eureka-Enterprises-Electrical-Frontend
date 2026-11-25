/** PAID → Paid, PARTIAL → Partial. */
export function formatLedgerStatus(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** "2023-24 · Q2", or "" when the invoice has no date yet. */
export function formatLedgerPeriod(
  financialYear: string | null,
  quarter: string | null
): string {
  return [financialYear ? `FY ${financialYear}` : '', quarter ?? '']
    .filter(Boolean)
    .join(' · ');
}
