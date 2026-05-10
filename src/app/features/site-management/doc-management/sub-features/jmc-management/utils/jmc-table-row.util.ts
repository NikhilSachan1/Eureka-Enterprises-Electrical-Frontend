import { IJmcGetBaseResponseDto } from '../types/jmc.dto';
import { EApprovalStatus } from '@shared/types';

function normalizeJmcApprovalStatus(status: string | null | undefined): string {
  return (status?.toLowerCase() ?? '').trim();
}

function isJmcApprovalPending(row: IJmcGetBaseResponseDto): boolean {
  const s = normalizeJmcApprovalStatus(row.approvalStatus);
  return s === EApprovalStatus.PENDING || s === 'pending approval';
}

function isJmcApproved(row: IJmcGetBaseResponseDto): boolean {
  return (
    normalizeJmcApprovalStatus(row.approvalStatus) === EApprovalStatus.APPROVED
  );
}

function isJmcRejected(row: IJmcGetBaseResponseDto): boolean {
  return (
    normalizeJmcApprovalStatus(row.approvalStatus) === EApprovalStatus.REJECTED
  );
}

/** Approve: only pending or rejected (re-approve after reject). */
export function shouldDisableJmcApprove(row: IJmcGetBaseResponseDto): boolean {
  return !isJmcApprovalPending(row) && !isJmcRejected(row);
}

/** Reject: only while pending (never after approved; not again after reject). */
export function shouldDisableJmcReject(row: IJmcGetBaseResponseDto): boolean {
  return !isJmcApprovalPending(row);
}

export function jmcApproveDisableReason(row: IJmcGetBaseResponseDto): string {
  if (!shouldDisableJmcApprove(row)) {
    return '';
  }
  if (isJmcApproved(row)) {
    return JMC_ROW_ACTION_DISABLE_REASON.approveAlreadyApproved;
  }
  return JMC_ROW_ACTION_DISABLE_REASON.approveOnlyPendingOrRejected;
}

export function jmcRejectDisableReason(row: IJmcGetBaseResponseDto): string {
  if (!shouldDisableJmcReject(row)) {
    return '';
  }
  if (isJmcApproved(row)) {
    return JMC_ROW_ACTION_DISABLE_REASON.rejectNotAllowedAfterApproved;
  }
  if (isJmcRejected(row)) {
    return JMC_ROW_ACTION_DISABLE_REASON.rejectAlreadyRejected;
  }
  return JMC_ROW_ACTION_DISABLE_REASON.rejectOnlyWhilePending;
}

export function shouldDisableJmcEditOrDelete(
  row: IJmcGetBaseResponseDto
): boolean {
  return row.isLocked === true;
}

export const JMC_ROW_ACTION_DISABLE_REASON = {
  approveAlreadyApproved: 'This JMC is already approved.',
  approveOnlyPendingOrRejected:
    'Approve is only available when the JMC is pending or was rejected.',
  rejectOnlyWhilePending: 'Reject is only available while the JMC is pending.',
  rejectNotAllowedAfterApproved:
    'You cannot reject a JMC that has already been approved.',
  rejectAlreadyRejected: 'This JMC is already rejected.',
  lockedNoEdit: 'This JMC is locked. Unlock it to edit.',
  lockedNoDelete: 'This JMC is locked. Unlock it to delete.',
  unlockRequestNotLocked:
    'Unlock can only be requested when the JMC is locked.',
  unlockRequestAlreadyQueued:
    'An unlock request is already pending for this JMC.',
  unlockRequestRejectNotLocked:
    'Rejecting the unlock request is only available while the JMC is locked.',
  unlockRequestRejectNoPending: 'There is no pending unlock request to reject.',
} as const;

function hasPendingUnlockRequest(row: IJmcGetBaseResponseDto): boolean {
  return row.unlockRequestedAt !== null && row.unlockRequestedAt !== undefined;
}

/**
 * Request unlock: only when locked and no unlock request is already queued.
 */
export function shouldDisableJmcUnlockRequest(
  row: IJmcGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return hasPendingUnlockRequest(row);
}

export function jmcUnlockRequestDisableReason(
  row: IJmcGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return JMC_ROW_ACTION_DISABLE_REASON.unlockRequestNotLocked;
  }
  if (hasPendingUnlockRequest(row)) {
    return JMC_ROW_ACTION_DISABLE_REASON.unlockRequestAlreadyQueued;
  }
  return '';
}

/**
 * Grant unlock: only when the JMC is still locked and an unlock request exists
 * ({@link IJmcGetBaseResponseDto.unlockRequestedAt}).
 */
export function shouldDisableJmcUnlockGrant(
  row: IJmcGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return !hasPendingUnlockRequest(row);
}

export function jmcUnlockGrantDisableReason(
  row: IJmcGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return 'Grant unlock is only available while the JMC is locked.';
  }
  if (!hasPendingUnlockRequest(row)) {
    return 'No pending unlock request for this JMC.';
  }
  return '';
}

/** Same eligibility as grant: locked with a pending unlock request. */
export function shouldDisableJmcUnlockRequestReject(
  row: IJmcGetBaseResponseDto
): boolean {
  return shouldDisableJmcUnlockGrant(row);
}

export function jmcUnlockRequestRejectDisableReason(
  row: IJmcGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return JMC_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNotLocked;
  }
  if (!hasPendingUnlockRequest(row)) {
    return JMC_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNoPending;
  }
  return '';
}
