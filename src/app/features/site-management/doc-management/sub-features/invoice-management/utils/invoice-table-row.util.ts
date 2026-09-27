import { IInvoiceGetBaseResponseDto } from '../types/invoice.dto';
import { EApprovalStatus, EDataType } from '@shared/types';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { APP_CONFIG } from '@core/config';
import { roundCurrencyAmount } from '@shared/utility';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

function normalizeInvoiceApprovalStatus(
  status: string | null | undefined
): string {
  return (status?.toLowerCase() ?? '').trim();
}

function isInvoiceApprovalPending(row: IInvoiceGetBaseResponseDto): boolean {
  const s = normalizeInvoiceApprovalStatus(row.approvalStatus);
  return s === EApprovalStatus.PENDING || s === 'pending approval';
}

function isInvoiceApproved(row: IInvoiceGetBaseResponseDto): boolean {
  return (
    normalizeInvoiceApprovalStatus(row.approvalStatus) ===
    EApprovalStatus.APPROVED
  );
}

function isInvoiceRejected(row: IInvoiceGetBaseResponseDto): boolean {
  return (
    normalizeInvoiceApprovalStatus(row.approvalStatus) ===
    EApprovalStatus.REJECTED
  );
}

/** Approve: only pending or rejected (re-approve after reject). */
export function shouldDisableInvoiceApprove(
  row: IInvoiceGetBaseResponseDto
): boolean {
  return !isInvoiceApprovalPending(row) && !isInvoiceRejected(row);
}

/** Reject: only while pending (never after approved; not again after reject). */
export function shouldDisableInvoiceReject(
  row: IInvoiceGetBaseResponseDto
): boolean {
  return !isInvoiceApprovalPending(row);
}

export function invoiceApproveDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (!shouldDisableInvoiceApprove(row)) {
    return '';
  }
  if (isInvoiceApproved(row)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.approveAlreadyApproved;
  }
  return INVOICE_ROW_ACTION_DISABLE_REASON.approveOnlyPendingOrRejected;
}

export function invoiceRejectDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (!shouldDisableInvoiceReject(row)) {
    return '';
  }
  if (isInvoiceApproved(row)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.rejectNotAllowedAfterApproved;
  }
  if (isInvoiceRejected(row)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.rejectAlreadyRejected;
  }
  return INVOICE_ROW_ACTION_DISABLE_REASON.rejectOnlyWhilePending;
}

export function buildInvoiceGstAmountSuffix(
  gstPercentagePart: string,
  isGstHold: boolean | undefined | null
): string {
  const holdStatus = isGstHold === false ? 'No Hold' : 'Hold';
  return `${gstPercentagePart} · ${holdStatus}`;
}

function formatInvoicePercentSuffix(
  percentage: string | number | null | undefined
): string {
  const raw = String(percentage ?? '').trim();
  if (!raw) {
    return '';
  }
  return raw.startsWith('(') ? raw : `(${raw.replace(/%$/, '')}%)`;
}

function buildInvoiceAmountEmptyPlaceholderSegment(): IDocAmountSegment {
  return {
    dataType: EDataType.CURRENCY,
    label: '',
    value: null,
  };
}

function sourceInvoiceRow(
  row: IInvoiceGetBaseResponseDto
): IInvoiceGetBaseResponseDto {
  const withOriginal = row as IInvoiceGetBaseResponseDto & {
    originalRawData?: IInvoiceGetBaseResponseDto;
  };
  return withOriginal.originalRawData ?? row;
}

export function parseInvoiceAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function getInvoiceAdvanceSettlements(
  row: IInvoiceGetBaseResponseDto
): IInvoiceGetBaseResponseDto['advanceSettlements'] {
  return sourceInvoiceRow(row).advanceSettlements;
}

export function hasInvoiceAdvanceSettlements(
  row: IInvoiceGetBaseResponseDto
): boolean {
  return getInvoiceAdvanceSettlements(row).length > 0;
}

export function invoiceAdvanceSettlementTotals(
  row: IInvoiceGetBaseResponseDto
): { count: number; amount: number } {
  const settlements = getInvoiceAdvanceSettlements(row);
  const summed = settlements.reduce((total, settlement) => {
    return total + (parseInvoiceAmount(settlement.amount) ?? 0);
  }, 0);
  const fallback =
    parseInvoiceAmount(sourceInvoiceRow(row).advanceSettledAmount) ?? 0;
  return {
    count: settlements.length,
    amount: settlements.length > 0 ? summed : fallback,
  };
}

function formatInvoiceCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function invoiceAdvanceSettlementUnlockReason(
  row: IInvoiceGetBaseResponseDto
): string {
  const { count, amount } = invoiceAdvanceSettlementTotals(row);
  const settlementLabel = count === 1 ? 'settlement' : 'settlements';
  return `Unlock is blocked while ${count} advance ${settlementLabel} totaling ${formatInvoiceCurrency(amount)} are applied. Reverse them first.`;
}

export function invoiceAdvanceRemainingAmount(
  row: IInvoiceGetBaseResponseDto
): number {
  const source = sourceInvoiceRow(row);
  const gstAmount = parseInvoiceAmount(source.gstAmount) ?? 0;
  const gstPayable = source.isGstHold === false ? gstAmount : 0;
  return roundCurrencyAmount(
    (parseInvoiceAmount(source.taxableAmount) ?? 0) -
      (parseInvoiceAmount(source.tdsAmount) ?? 0) +
      gstPayable -
      (parseInvoiceAmount(source.paidTotal) ?? 0) -
      (parseInvoiceAmount(source.advanceSettledAmount) ?? 0)
  );
}

export function buildInvoiceBookedPaidSegments(
  row: IInvoiceGetBaseResponseDto,
  isSales: boolean
): IDocAmountSegment[] {
  const source = sourceInvoiceRow(row);
  if (source.invoiceNumber === null) {
    return [buildInvoiceAmountEmptyPlaceholderSegment()];
  }
  const segments: IDocAmountSegment[] = [];
  if (!isSales) {
    segments.push({
      dataType: EDataType.CURRENCY,
      label: 'Booked',
      value: source.bookedTotal,
    });
  }
  segments.push(
    {
      dataType: EDataType.CURRENCY,
      label: 'Paid',
      value: source.paidTotal,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'Advance paid',
      value: source.advanceSettledAmount,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'Remaining',
      value: invoiceAdvanceRemainingAmount(source),
    }
  );
  return segments;
}

export function buildInvoiceAdvanceSettlementFlowSegments(
  row: IInvoiceGetBaseResponseDto
): IDocAmountSegment[] {
  const source = sourceInvoiceRow(row);
  if (source.invoiceNumber === null) {
    return [buildInvoiceAmountEmptyPlaceholderSegment()];
  }
  const settlements = getInvoiceAdvanceSettlements(source);
  if (settlements.length === 0) {
    return [buildInvoiceAmountEmptyPlaceholderSegment()];
  }

  return settlements.flatMap(settlement => {
    const segments: IDocAmountSegment[] = [
      {
        dataType: EDataType.CURRENCY,
        label: settlement.advanceNumber,
        value: settlement.amount,
      },
    ];
    if (settlement.settledAt) {
      segments.push({
        dataType: EDataType.DATE,
        label: '',
        value: settlement.settledAt,
      });
    }
    return segments;
  });
}

export function buildInvoiceTaxGstAmountSegments(input: {
  invoiceNumber?: string | null;
  taxableAmount: string;
  tdsAmount: string;
  tdsPercentage: string | number;
  gstAmount: string;
  gstPercentage: string | number;
  totalAmount: string;
  isGstHold?: boolean | null;
}): IDocAmountSegment[] {
  if (input.invoiceNumber === null) {
    return [buildInvoiceAmountEmptyPlaceholderSegment()];
  }

  return [
    {
      dataType: EDataType.CURRENCY,
      label: 'Taxable',
      value: input.taxableAmount,
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'TDS',
      value: input.tdsAmount,
      suffix: formatInvoicePercentSuffix(input.tdsPercentage),
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'GST',
      value: input.gstAmount,
      suffix: buildInvoiceGstAmountSuffix(
        formatInvoicePercentSuffix(input.gstPercentage),
        input.isGstHold
      ),
    },
    {
      dataType: EDataType.CURRENCY,
      label: 'Total',
      value: input.totalAmount,
    },
  ];
}

export function shouldDisableInvoiceEditOrDelete(
  row: IInvoiceGetBaseResponseDto
): boolean {
  return row.isLocked === true;
}

export const INVOICE_ROW_ACTION_DISABLE_REASON = {
  approveAlreadyApproved: 'This invoice is already approved.',
  approveOnlyPendingOrRejected:
    'Approve is only available when the invoice is pending or was rejected.',
  rejectOnlyWhilePending:
    'Reject is only available while the invoice is pending.',
  rejectNotAllowedAfterApproved:
    'You cannot reject an invoice that has already been approved.',
  rejectAlreadyRejected: 'This invoice is already rejected.',
  lockedNoEdit: 'This invoice is locked. Unlock it to edit.',
  lockedNoDelete: 'This invoice is locked. Unlock it to delete.',
  unlockRequestNotLocked:
    'Unlock can only be requested when the invoice is locked.',
  unlockRequestAlreadyQueued:
    'An unlock request is already pending for this invoice.',
  unlockRequestRejectNotLocked:
    'Rejecting the unlock request is only available while the invoice is locked.',
  unlockRequestRejectNoPending: 'There is no pending unlock request to reject.',
  settlePurchaseApprovedOnly:
    'Advance settlement is only available on approved purchase invoices.',
  unsettleNoSettlements: 'There is no advance settlement to reverse.',
} as const;

function hasPendingUnlockRequest(row: IInvoiceGetBaseResponseDto): boolean {
  return row.unlockRequestedAt !== null && row.unlockRequestedAt !== undefined;
}

/**
 * Request unlock: only when locked and no unlock request is already queued.
 */
export function shouldDisableInvoiceUnlockRequest(
  row: IInvoiceGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  if (hasInvoiceAdvanceSettlements(row)) {
    return true;
  }
  return hasPendingUnlockRequest(row);
}

export function invoiceUnlockRequestDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.unlockRequestNotLocked;
  }
  if (hasInvoiceAdvanceSettlements(row)) {
    return invoiceAdvanceSettlementUnlockReason(row);
  }
  if (hasPendingUnlockRequest(row)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.unlockRequestAlreadyQueued;
  }
  return '';
}

/**
 * Grant unlock: only when the invoice is still locked and an unlock request exists
 * ({@link IInvoiceGetBaseResponseDto.unlockRequestedAt}).
 */
export function shouldDisableInvoiceUnlockGrant(
  row: IInvoiceGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  if (hasInvoiceAdvanceSettlements(row)) {
    return true;
  }
  return !hasPendingUnlockRequest(row);
}

export function invoiceUnlockGrantDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return 'Grant unlock is only available while the invoice is locked.';
  }
  if (hasInvoiceAdvanceSettlements(row)) {
    return invoiceAdvanceSettlementUnlockReason(row);
  }
  if (!hasPendingUnlockRequest(row)) {
    return 'No pending unlock request for this invoice.';
  }
  return '';
}

/** Same eligibility as grant: locked with a pending unlock request. */
export function shouldDisableInvoiceUnlockRequestReject(
  row: IInvoiceGetBaseResponseDto
): boolean {
  return shouldDisableInvoiceUnlockGrant(row);
}

export function invoiceUnlockRequestRejectDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNotLocked;
  }
  if (!hasPendingUnlockRequest(row)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNoPending;
  }
  return '';
}

export function isInvoicePurchaseParty(
  row: IInvoiceGetBaseResponseDto
): boolean {
  return sourceInvoiceRow(row).partyType === EDocContext.PURCHASE;
}

export function shouldDisableInvoiceSettleAdvance(
  row: IInvoiceGetBaseResponseDto
): boolean {
  const source = sourceInvoiceRow(row);
  return !isInvoicePurchaseParty(source) || !isInvoiceApproved(source);
}

export function invoiceSettleAdvanceDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (!shouldDisableInvoiceSettleAdvance(row)) {
    return '';
  }
  return INVOICE_ROW_ACTION_DISABLE_REASON.settlePurchaseApprovedOnly;
}

export function shouldDisableInvoiceUnsettleAdvance(
  row: IInvoiceGetBaseResponseDto
): boolean {
  const source = sourceInvoiceRow(row);
  return (
    !isInvoicePurchaseParty(source) || !hasInvoiceAdvanceSettlements(source)
  );
}

export function invoiceUnsettleAdvanceDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  const source = sourceInvoiceRow(row);
  if (!isInvoicePurchaseParty(source)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.settlePurchaseApprovedOnly;
  }
  if (!hasInvoiceAdvanceSettlements(source)) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.unsettleNoSettlements;
  }
  return '';
}
