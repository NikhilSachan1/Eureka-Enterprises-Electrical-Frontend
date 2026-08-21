import { EDataType } from '@shared/types';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { EDocReferenceHierarchyKind } from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import { IPaymentRequestGetBaseResponseDto } from '../types/payment-request.dto';

export interface IPaymentRequestLinkedDocView {
  kind: EDocReferenceHierarchyKind;
  number: string;
  date: string | null;
  amountSegments: IDocAmountSegment[];
}

type PaymentRequestLinkedInvoice = NonNullable<
  IPaymentRequestGetBaseResponseDto['invoice']
>;
type PaymentRequestLinkedPo = NonNullable<
  IPaymentRequestGetBaseResponseDto['po']
>;

function displayDocNumber(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '—';
}

function displayDocDate(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function linkedDocAmountSegments(input: {
  taxableAmount?: string | number | null;
  tdsAmount?: string | number | null;
  gstAmount?: string | number | null;
  totalAmount?: string | number | null;
  includeTds?: boolean;
}): IDocAmountSegment[] {
  const segments: IDocAmountSegment[] = [
    {
      dataType: EDataType.CURRENCY,
      label: 'Taxable',
      value: input.taxableAmount,
    },
  ];

  if (input.includeTds) {
    segments.push({
      dataType: EDataType.CURRENCY,
      label: 'TDS',
      value: input.tdsAmount,
    });
  }

  segments.push(
    {
      dataType: EDataType.CURRENCY,
      label: 'GST',
      value: input.gstAmount,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'Total',
      value: input.totalAmount,
    }
  );

  return segments;
}

function buildInvoiceLinkedDoc(
  invoice: PaymentRequestLinkedInvoice | null | undefined
): IPaymentRequestLinkedDocView {
  return {
    kind: EDocReferenceHierarchyKind.Invoice,
    number: displayDocNumber(invoice?.invoiceNumber),
    date: displayDocDate(invoice?.invoiceDate),
    amountSegments: linkedDocAmountSegments({
      taxableAmount: invoice?.taxableAmount,
      tdsAmount: invoice?.tdsAmount,
      gstAmount: invoice?.gstAmount,
      totalAmount: invoice?.totalAmount,
      includeTds: true,
    }),
  };
}

function buildPoLinkedDoc(
  po: PaymentRequestLinkedPo | null | undefined
): IPaymentRequestLinkedDocView {
  return {
    kind: EDocReferenceHierarchyKind.Po,
    number: displayDocNumber(po?.poNumber),
    date: displayDocDate(po?.poDate),
    amountSegments: linkedDocAmountSegments({
      taxableAmount: po?.taxableAmount,
      gstAmount: po?.gstAmount,
      totalAmount: po?.totalAmount,
    }),
  };
}

export function buildPaymentRequestInvoiceDoc(
  record: IPaymentRequestGetBaseResponseDto
): IPaymentRequestLinkedDocView {
  return buildInvoiceLinkedDoc(record.invoice);
}

export function buildPaymentRequestPoDoc(
  record: IPaymentRequestGetBaseResponseDto
): IPaymentRequestLinkedDocView {
  return buildPoLinkedDoc(record.po);
}

function normalizePaymentRequestStatus(
  status: string | null | undefined
): string {
  return (status ?? '').trim().toLowerCase();
}

export function isPaymentRequestPending(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  const status = normalizePaymentRequestStatus(row.status);
  return status === 'pending' || status === 'pending approval';
}

export function parsePaymentRequestAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function shouldDisablePaymentRequestApprove(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export function shouldDisablePaymentRequestReject(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export const PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON = {
  actionOnlyWhilePending:
    'Approve and reject are only available while the payment request is pending.',
  editOnlyWhilePending:
    'Edit is only available while the payment request is pending.',
  deleteOnlyWhilePending:
    'Delete is only available while the payment request is pending.',
} as const;

export function shouldDisablePaymentRequestEdit(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export function shouldDisablePaymentRequestDelete(
  row: IPaymentRequestGetBaseResponseDto
): boolean {
  return !isPaymentRequestPending(row);
}

export function paymentRequestEditDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestEdit(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.editOnlyWhilePending;
}

export function paymentRequestDeleteDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestDelete(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.deleteOnlyWhilePending;
}

export function paymentRequestApproveDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestApprove(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.actionOnlyWhilePending;
}

export function paymentRequestRejectDisableReason(
  row: IPaymentRequestGetBaseResponseDto
): string {
  if (!shouldDisablePaymentRequestReject(row)) {
    return '';
  }
  return PAYMENT_REQUEST_ROW_ACTION_DISABLE_REASON.actionOnlyWhilePending;
}
