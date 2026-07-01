import { IBookPaymentGetBaseResponseDto } from '../types/book-payment.dto';
import { EApprovalStatus } from '@shared/types';

function normalizeBookPaymentApprovalStatus(
  status: string | null | undefined
): string {
  return (status?.toLowerCase() ?? '').trim();
}

function isBookPaymentApprovalPending(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  const s = normalizeBookPaymentApprovalStatus(row.approvalStatus);
  return s === EApprovalStatus.PENDING || s === 'pending approval';
}

function isBookPaymentApproved(row: IBookPaymentGetBaseResponseDto): boolean {
  return (
    normalizeBookPaymentApprovalStatus(row.approvalStatus) ===
    EApprovalStatus.APPROVED
  );
}

function isBookPaymentRejected(row: IBookPaymentGetBaseResponseDto): boolean {
  return (
    normalizeBookPaymentApprovalStatus(row.approvalStatus) ===
    EApprovalStatus.REJECTED
  );
}

export function shouldDisableBookPaymentApprove(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  return !isBookPaymentApprovalPending(row) && !isBookPaymentRejected(row);
}

export function shouldDisableBookPaymentReject(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  return !isBookPaymentApprovalPending(row);
}

export function bookPaymentApproveDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string {
  if (!shouldDisableBookPaymentApprove(row)) {
    return '';
  }
  if (isBookPaymentApproved(row)) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.approveAlreadyApproved;
  }
  return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.approveOnlyPendingOrRejected;
}

export function bookPaymentRejectDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string {
  if (!shouldDisableBookPaymentReject(row)) {
    return '';
  }
  if (isBookPaymentApproved(row)) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.rejectNotAllowedAfterApproved;
  }
  if (isBookPaymentRejected(row)) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.rejectAlreadyRejected;
  }
  return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.rejectOnlyWhilePending;
}

export function shouldDisableBookPaymentEditOrDelete(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  return row.isLocked === true || row.hasTransfer === true;
}

export function bookPaymentEditDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string | undefined {
  if (row.isLocked === true) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.lockedNoEdit;
  }
  if (row.hasTransfer === true) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.paymentDoneNoEdit;
  }
  return undefined;
}

export function bookPaymentDeleteDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string | undefined {
  if (row.isLocked === true) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.lockedNoDelete;
  }
  if (row.hasTransfer === true) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.paymentDoneNoDelete;
  }
  return undefined;
}

export const BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON = {
  approveAlreadyApproved: 'This book payment is already approved.',
  approveOnlyPendingOrRejected:
    'Approve is only available when the book payment is pending or was rejected.',
  rejectOnlyWhilePending:
    'Reject is only available while the book payment is pending.',
  rejectNotAllowedAfterApproved:
    'You cannot reject a book payment that has already been approved.',
  rejectAlreadyRejected: 'This book payment is already rejected.',
  lockedNoEdit: 'This book payment is locked. Unlock it to edit.',
  lockedNoDelete: 'This book payment is locked. Unlock it to delete.',
  paymentDoneNoEdit: 'Payment is already done. Edit is not allowed.',
  paymentDoneNoDelete: 'Payment is already done. Delete is not allowed.',
  unlockRequestNotLocked:
    'Unlock can only be requested when the book payment is locked.',
  unlockRequestAlreadyQueued:
    'An unlock request is already pending for this book payment.',
  unlockRequestRejectNotLocked:
    'Rejecting the unlock request is only available while the book payment is locked.',
  unlockRequestRejectNoPending: 'There is no pending unlock request to reject.',
} as const;

function hasPendingUnlockRequest(row: IBookPaymentGetBaseResponseDto): boolean {
  return row.unlockRequestedAt !== null && row.unlockRequestedAt !== undefined;
}

export function shouldDisableBookPaymentUnlockRequest(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return hasPendingUnlockRequest(row);
}

export function bookPaymentUnlockRequestDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.unlockRequestNotLocked;
  }
  if (hasPendingUnlockRequest(row)) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.unlockRequestAlreadyQueued;
  }
  return '';
}

export function shouldDisableBookPaymentUnlockGrant(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return !hasPendingUnlockRequest(row);
}

export function bookPaymentUnlockGrantDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return 'Grant unlock is only available while the book payment is locked.';
  }
  if (!hasPendingUnlockRequest(row)) {
    return 'No pending unlock request for this book payment.';
  }
  return '';
}

export function shouldDisableBookPaymentUnlockRequestReject(
  row: IBookPaymentGetBaseResponseDto
): boolean {
  return shouldDisableBookPaymentUnlockGrant(row);
}

export function bookPaymentUnlockRequestRejectDisableReason(
  row: IBookPaymentGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNotLocked;
  }
  if (!hasPendingUnlockRequest(row)) {
    return BOOK_PAYMENT_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNoPending;
  }
  return '';
}
