import { EDataType } from '@shared/types';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { EDocReferenceHierarchyKind } from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import type { IDocMetricSummaryRow } from '@features/site-management/doc-management/sub-features/book-payment-management/components/book-payment-invoice-summary/book-payment-invoice-summary.component';
import { IAdvancePaymentGetBaseResponseDto } from '../types/advance-payment.dto';

export interface IAdvancePaymentLinkedDocView {
  kind: EDocReferenceHierarchyKind;
  number: string;
  date: string | null;
  amountSegments: IDocAmountSegment[];
}

function locationSubtitle(
  city?: string | null,
  state?: string | null
): string {
  return [city, state]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ');
}

export function resolveAdvancePaymentPoNumber(
  record: IAdvancePaymentGetBaseResponseDto
): string | undefined {
  return record.po?.poNumber ?? record.poNumber ?? undefined;
}

export function resolveAdvancePaymentPoId(
  record: IAdvancePaymentGetBaseResponseDto
): string | undefined {
  return record.poId ?? record.po?.id ?? undefined;
}

export function resolveAdvancePaymentSiteId(
  record: IAdvancePaymentGetBaseResponseDto
): string | undefined {
  return record.siteId ?? record.site?.id ?? undefined;
}

export function resolveAdvancePaymentFileKeys(
  record: IAdvancePaymentGetBaseResponseDto
): string[] {
  return record.fileKey ? [record.fileKey] : [];
}

export function resolveAdvancePaymentVendorName(
  record: IAdvancePaymentGetBaseResponseDto
): string {
  return record.vendor?.name ?? record.vendorName ?? '';
}

export function resolveAdvancePaymentSiteName(
  record: IAdvancePaymentGetBaseResponseDto
): string {
  return record.site?.name ?? record.siteName ?? '';
}

export function buildAdvancePaymentWorkspaceContext(
  record: IAdvancePaymentGetBaseResponseDto
) {
  return {
    companyName: record.company?.name ?? '',
    partyName: resolveAdvancePaymentVendorName(record),
    projectName: resolveAdvancePaymentSiteName(record),
    siteLocationSubtitle: locationSubtitle(
      record.site?.city,
      record.site?.state
    ),
  };
}

export function buildAdvancePaymentPoSummaryRows(meta: {
  totalAmount?: string | number | null;
  invoicedTotal?: string | number | null;
  remaining?: string | number | null;
  advancePayment?: {
    amount?: string | number | null;
    settled?: string | number | null;
    remaining?: string | number | null;
  } | null;
}): IDocMetricSummaryRow[] {
  const rows: IDocMetricSummaryRow[] = [
    {
      title: 'PO',
      items: [
        { label: 'Total', value: meta.totalAmount, tone: 'total' },
        { label: 'Invoiced', value: meta.invoicedTotal, tone: 'invoiced' },
        { label: 'Remaining', value: meta.remaining, tone: 'remaining' },
      ],
    },
  ];

  if (meta.advancePayment) {
    rows.push({
      title: 'Advance',
      items: [
        {
          label: 'Amount',
          value: meta.advancePayment.amount ?? 0,
          tone: 'booked',
        },
        {
          label: 'Settled',
          value: meta.advancePayment.settled ?? 0,
          tone: 'paid',
        },
        {
          label: 'Remaining',
          value: meta.advancePayment.remaining ?? 0,
          tone: 'remaining',
        },
      ],
    });
  }

  return rows;
}

function displayDocNumber(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return '—';
  }
  return trimmed;
}

function displayDocDate(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

export function buildAdvancePaymentPoDoc(
  record: IAdvancePaymentGetBaseResponseDto
): IAdvancePaymentLinkedDocView {
  const po = record.po;
  return {
    kind: EDocReferenceHierarchyKind.Po,
    number: displayDocNumber(resolveAdvancePaymentPoNumber(record)),
    date: displayDocDate(po?.poDate),
    amountSegments: po
      ? [
          {
            dataType: EDataType.CURRENCY,
            label: 'Taxable',
            value: po.taxableAmount,
          },
          {
            dataType: EDataType.CURRENCY,
            label: 'GST',
            value: po.gstAmount,
          },
          {
            dataType: EDataType.CURRENCY,
            label: 'Total',
            value: po.totalAmount,
          },
        ]
      : [],
  };
}

function normalizeAdvancePaymentStatus(
  status: string | null | undefined
): string {
  return (status ?? '').trim().toLowerCase();
}

export function isAdvancePaymentPending(
  row: IAdvancePaymentGetBaseResponseDto
): boolean {
  const status = normalizeAdvancePaymentStatus(row.approvalStatus);
  return status === 'pending' || status === 'pending approval';
}

export function parseAdvancePaymentAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function shouldDisableAdvancePaymentApprove(
  row: IAdvancePaymentGetBaseResponseDto
): boolean {
  return !isAdvancePaymentPending(row);
}

export function shouldDisableAdvancePaymentReject(
  row: IAdvancePaymentGetBaseResponseDto
): boolean {
  return !isAdvancePaymentPending(row);
}

export const ADVANCE_PAYMENT_ROW_ACTION_DISABLE_REASON = {
  actionOnlyWhilePending:
    'Approve and reject are only available while the advance payment is pending.',
  editOnlyWhilePending:
    'Edit is only available while the advance payment is pending.',
  deleteOnlyWhilePending:
    'Delete is only available while the advance payment is pending.',
} as const;

export function shouldDisableAdvancePaymentEdit(
  row: IAdvancePaymentGetBaseResponseDto
): boolean {
  return !isAdvancePaymentPending(row);
}

export function shouldDisableAdvancePaymentDelete(
  row: IAdvancePaymentGetBaseResponseDto
): boolean {
  return !isAdvancePaymentPending(row);
}

export function advancePaymentEditDisableReason(
  row: IAdvancePaymentGetBaseResponseDto
): string {
  if (!shouldDisableAdvancePaymentEdit(row)) {
    return '';
  }
  return ADVANCE_PAYMENT_ROW_ACTION_DISABLE_REASON.editOnlyWhilePending;
}

export function advancePaymentDeleteDisableReason(
  row: IAdvancePaymentGetBaseResponseDto
): string {
  if (!shouldDisableAdvancePaymentDelete(row)) {
    return '';
  }
  return ADVANCE_PAYMENT_ROW_ACTION_DISABLE_REASON.deleteOnlyWhilePending;
}

export function advancePaymentApproveDisableReason(
  row: IAdvancePaymentGetBaseResponseDto
): string {
  if (!shouldDisableAdvancePaymentApprove(row)) {
    return '';
  }
  return ADVANCE_PAYMENT_ROW_ACTION_DISABLE_REASON.actionOnlyWhilePending;
}

export function advancePaymentRejectDisableReason(
  row: IAdvancePaymentGetBaseResponseDto
): string {
  if (!shouldDisableAdvancePaymentReject(row)) {
    return '';
  }
  return ADVANCE_PAYMENT_ROW_ACTION_DISABLE_REASON.actionOnlyWhilePending;
}
