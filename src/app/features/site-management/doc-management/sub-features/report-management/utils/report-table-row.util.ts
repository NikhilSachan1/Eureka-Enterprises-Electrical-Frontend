import { IReportGetBaseResponseDto } from '../types/report.dto';
import { EApprovalStatus } from '@shared/types';

function normalizeReportApprovalStatus(
  status: string | null | undefined
): string {
  return (status?.toLowerCase() ?? '').trim();
}

function isReportApprovalPending(row: IReportGetBaseResponseDto): boolean {
  const s = normalizeReportApprovalStatus(row.approvalStatus);
  return s === EApprovalStatus.PENDING || s === 'pending approval';
}

function isReportApproved(row: IReportGetBaseResponseDto): boolean {
  return (
    normalizeReportApprovalStatus(row.approvalStatus) ===
    EApprovalStatus.APPROVED
  );
}

function isReportRejected(row: IReportGetBaseResponseDto): boolean {
  return (
    normalizeReportApprovalStatus(row.approvalStatus) ===
    EApprovalStatus.REJECTED
  );
}

export function shouldDisableReportApprove(
  row: IReportGetBaseResponseDto
): boolean {
  return !isReportApprovalPending(row) && !isReportRejected(row);
}

export function shouldDisableReportReject(
  row: IReportGetBaseResponseDto
): boolean {
  return !isReportApprovalPending(row);
}

export function reportApproveDisableReason(
  row: IReportGetBaseResponseDto
): string {
  if (!shouldDisableReportApprove(row)) {
    return '';
  }
  if (isReportApproved(row)) {
    return REPORT_ROW_ACTION_DISABLE_REASON.approveAlreadyApproved;
  }
  return REPORT_ROW_ACTION_DISABLE_REASON.approveOnlyPendingOrRejected;
}

export function reportRejectDisableReason(
  row: IReportGetBaseResponseDto
): string {
  if (!shouldDisableReportReject(row)) {
    return '';
  }
  if (isReportApproved(row)) {
    return REPORT_ROW_ACTION_DISABLE_REASON.rejectNotAllowedAfterApproved;
  }
  if (isReportRejected(row)) {
    return REPORT_ROW_ACTION_DISABLE_REASON.rejectAlreadyRejected;
  }
  return REPORT_ROW_ACTION_DISABLE_REASON.rejectOnlyWhilePending;
}

export function shouldDisableReportEditOrDelete(
  row: IReportGetBaseResponseDto
): boolean {
  return row.isLocked === true;
}

export const REPORT_ROW_ACTION_DISABLE_REASON = {
  approveAlreadyApproved: 'This report is already approved.',
  approveOnlyPendingOrRejected:
    'Approve is only available when the report is pending or was rejected.',
  rejectOnlyWhilePending:
    'Reject is only available while the report is pending.',
  rejectNotAllowedAfterApproved:
    'You cannot reject a report that has already been approved.',
  rejectAlreadyRejected: 'This report is already rejected.',
  lockedNoEdit: 'This report is locked. Unlock it to edit.',
  lockedNoDelete: 'This report is locked. Unlock it to delete.',
  unlockRequestNotLocked:
    'Unlock can only be requested when the report is locked.',
  unlockRequestAlreadyQueued:
    'An unlock request is already pending for this report.',
  unlockRequestRejectNotLocked:
    'Rejecting the unlock request is only available while the report is locked.',
  unlockRequestRejectNoPending: 'There is no pending unlock request to reject.',
} as const;

function hasPendingUnlockRequest(row: IReportGetBaseResponseDto): boolean {
  return row.unlockRequestedAt !== null && row.unlockRequestedAt !== undefined;
}

export function shouldDisableReportUnlockRequest(
  row: IReportGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return hasPendingUnlockRequest(row);
}

export function reportUnlockRequestDisableReason(
  row: IReportGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return REPORT_ROW_ACTION_DISABLE_REASON.unlockRequestNotLocked;
  }
  if (hasPendingUnlockRequest(row)) {
    return REPORT_ROW_ACTION_DISABLE_REASON.unlockRequestAlreadyQueued;
  }
  return '';
}

export function shouldDisableReportUnlockGrant(
  row: IReportGetBaseResponseDto
): boolean {
  if (row.isLocked !== true) {
    return true;
  }
  return !hasPendingUnlockRequest(row);
}

export function reportUnlockGrantDisableReason(
  row: IReportGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return 'Grant unlock is only available while the report is locked.';
  }
  if (!hasPendingUnlockRequest(row)) {
    return 'No pending unlock request for this report.';
  }
  return '';
}

export function shouldDisableReportUnlockRequestReject(
  row: IReportGetBaseResponseDto
): boolean {
  return shouldDisableReportUnlockGrant(row);
}

export function reportUnlockRequestRejectDisableReason(
  row: IReportGetBaseResponseDto
): string {
  if (row.isLocked !== true) {
    return REPORT_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNotLocked;
  }
  if (!hasPendingUnlockRequest(row)) {
    return REPORT_ROW_ACTION_DISABLE_REASON.unlockRequestRejectNoPending;
  }
  return '';
}
