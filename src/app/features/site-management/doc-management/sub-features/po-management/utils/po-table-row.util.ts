import { IPoGetBaseResponseDto } from '../types/po.dto';
import { EApprovalStatus } from '@shared/types';

function normalizePoApprovalStatus(status: string | null | undefined): string {
  return (status?.toLowerCase() ?? '').trim();
}

function isPoApprovalPending(row: IPoGetBaseResponseDto): boolean {
  const s = normalizePoApprovalStatus(row.approvalStatus);
  return s === EApprovalStatus.PENDING || s === 'pending approval';
}

function isPoApproved(row: IPoGetBaseResponseDto): boolean {
  return (
    normalizePoApprovalStatus(row.approvalStatus) === EApprovalStatus.APPROVED
  );
}

function isPoRejected(row: IPoGetBaseResponseDto): boolean {
  return (
    normalizePoApprovalStatus(row.approvalStatus) === EApprovalStatus.REJECTED
  );
}

/** Approve: only pending or rejected (re-approve after reject). */
export function shouldDisablePoApprove(row: IPoGetBaseResponseDto): boolean {
  return !isPoApprovalPending(row) && !isPoRejected(row);
}

/** Reject: only while pending (never after approved; not again after reject). */
export function shouldDisablePoReject(row: IPoGetBaseResponseDto): boolean {
  return !isPoApprovalPending(row);
}

export function poApproveDisableReason(row: IPoGetBaseResponseDto): string {
  if (!shouldDisablePoApprove(row)) {
    return '';
  }
  if (isPoApproved(row)) {
    return PO_ROW_ACTION_DISABLE_REASON.approveAlreadyApproved;
  }
  return PO_ROW_ACTION_DISABLE_REASON.approveOnlyPendingOrRejected;
}

export function poRejectDisableReason(row: IPoGetBaseResponseDto): string {
  if (!shouldDisablePoReject(row)) {
    return '';
  }
  if (isPoApproved(row)) {
    return PO_ROW_ACTION_DISABLE_REASON.rejectNotAllowedAfterApproved;
  }
  if (isPoRejected(row)) {
    return PO_ROW_ACTION_DISABLE_REASON.rejectAlreadyRejected;
  }
  return PO_ROW_ACTION_DISABLE_REASON.rejectOnlyWhilePending;
}

export function shouldDisablePoEditOrDelete(
  row: IPoGetBaseResponseDto
): boolean {
  return row.isLocked === true;
}

export const PO_ROW_ACTION_DISABLE_REASON = {
  approveAlreadyApproved: 'This PO is already approved.',
  approveOnlyPendingOrRejected:
    'Approve is only available when the PO is pending or was rejected.',
  rejectOnlyWhilePending: 'Reject is only available while the PO is pending.',
  rejectNotAllowedAfterApproved:
    'You cannot reject a PO that has already been approved.',
  rejectAlreadyRejected: 'This PO is already rejected.',
  lockedNoEdit: 'This PO is locked. Unlock it to edit.',
  lockedNoDelete: 'This PO is locked. Unlock it to delete.',
  unlockRequestNotLocked: 'Unlock can only be requested when the PO is locked.',
  unlockRequestAlreadyQueued:
    'An unlock request is already pending for this PO.',
  unlockRequestRejectNotLocked:
    'Rejecting the unlock request is only available while the PO is locked.',
  unlockRequestRejectNoPending: 'There is no pending unlock request to reject.',
} as const;

function hasPendingUnlockRequest(row: IPoGetBaseResponseDto): boolean {
  return row.unlockRequestedAt !== null && row.unlockRequestedAt !== undefined;
}

/**
 * Request unlock: only when locked and no unlock request is already queued.
 */
export function shouldDisablePoUnlockRequest(
  row: IPoGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return hasPendingUnlockRequest(row);
}

export function poUnlockRequestDisableReason(
  row: IPoGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return PO_ROW_ACTION_DISABLE_REASON.unlockRequestNotLocked;
  }
  if (hasPendingUnlockRequest(row)) {
    return PO_ROW_ACTION_DISABLE_REASON.unlockRequestAlreadyQueued;
  }
  return '';
}

/**
 * Grant unlock: only when the PO is still locked and an unlock request exists
 * ({@link IPoGetBaseResponseDto.unlockRequestedAt}).
 */
export function shouldDisablePoUnlockGrant(
  row: IPoGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return !hasPendingUnlockRequest(row);
}

export function poUnlockGrantDisableReason(row: IPoGetBaseResponseDto): string {
  if (row.isLocked !== true) {
    return 'Grant unlock is only available while the PO is locked.';
  }
  if (!hasPendingUnlockRequest(row)) {
    return 'No pending unlock request for this PO.';
  }
  return '';
}

/** Same eligibility as grant: locked with a pending unlock request. */
export function shouldDisablePoUnlockRequestReject(
  row: IPoGetBaseResponseDto
): boolean {
  return shouldDisablePoUnlockGrant(row);
}

export function poUnlockRequestRejectDisableReason(
  row: IPoGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return PO_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNotLocked;
  }
  if (!hasPendingUnlockRequest(row)) {
    return PO_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNoPending;
  }
  return '';
}
