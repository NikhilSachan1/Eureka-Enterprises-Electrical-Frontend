import { IInvoiceGetBaseResponseDto } from '../types/invoice.dto';
import { EApprovalStatus } from '@shared/types';

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
  return hasPendingUnlockRequest(row);
}

export function invoiceUnlockRequestDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return INVOICE_ROW_ACTION_DISABLE_REASON.unlockRequestNotLocked;
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
  return !hasPendingUnlockRequest(row);
}

export function invoiceUnlockGrantDisableReason(
  row: IInvoiceGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return 'Grant unlock is only available while the invoice is locked.';
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
