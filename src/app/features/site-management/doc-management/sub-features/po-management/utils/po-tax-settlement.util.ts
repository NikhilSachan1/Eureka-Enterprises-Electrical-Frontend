import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { EDataType } from '@shared/types';

export interface IPoTaxTotals {
  gstHeldTotal: number;
  gstSettledTotal: number;
  tdsTotal: number;
  tdsClearedTotal: number;
}

/**
 * Tax settled on a PO's invoices, shown beside Paid (never added to it — Paid is bank-transfer cash).
 *   Held GST → purchase: released to vendors · sale: received from the client
 *   TDS      → purchase: deposited via challan · sale: credited in Form 26AS
 */
export function buildPoTaxSettlementSegments(
  totals: IPoTaxTotals | null | undefined,
  isSales: boolean
): IDocAmountSegment[] {
  if (!totals) {
    return [];
  }
  const segments: IDocAmountSegment[] = [];

  if (totals.gstHeldTotal > 0) {
    segments.push({
      dataType: EDataType.CURRENCY,
      label: isSales ? 'Held GST received' : 'Held GST released',
      value: totals.gstSettledTotal,
      suffix: `of ${formatInr(totals.gstHeldTotal)}`,
    });
  }

  if (totals.tdsTotal > 0) {
    segments.push({
      dataType: EDataType.CURRENCY,
      label: isSales ? 'TDS in 26AS' : 'TDS deposited',
      value: totals.tdsClearedTotal,
      suffix: `of ${formatInr(totals.tdsTotal)}`,
    });
  }

  return segments;
}

function formatInr(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
