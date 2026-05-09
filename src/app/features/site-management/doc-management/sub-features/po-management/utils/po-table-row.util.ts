import { IPoGetBaseResponseDto } from '../types/po.dto';
import { EApprovalStatus } from '@shared/types';

function normalizePoApprovalStatus(status: string | null | undefined): string {
  return (status?.toLowerCase() ?? '').trim();
}

export function shouldDisablePoApprove(row: IPoGetBaseResponseDto): boolean {
  return (
    normalizePoApprovalStatus(row.approvalStatus) === EApprovalStatus.APPROVED
  );
}

export function shouldDisablePoReject(row: IPoGetBaseResponseDto): boolean {
  return (
    normalizePoApprovalStatus(row.approvalStatus) === EApprovalStatus.REJECTED
  );
}

export function shouldDisablePoEditOrDelete(
  row: IPoGetBaseResponseDto
): boolean {
  return row.isLocked === true;
}

export const PO_ROW_ACTION_DISABLE_REASON = {
  approveAlreadyApproved: 'This PO is already approved.',
  rejectAlreadyRejected: 'This PO is already rejected.',
  lockedNoEdit: 'This PO is locked. Unlock it to edit.',
  lockedNoDelete: 'This PO is locked. Unlock it to delete.',
  unlockRequestNotLocked: 'Unlock can only be requested when the PO is locked.',
  unlockRequestAlreadyQueued:
    'An unlock request is already pending for this PO.',
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
