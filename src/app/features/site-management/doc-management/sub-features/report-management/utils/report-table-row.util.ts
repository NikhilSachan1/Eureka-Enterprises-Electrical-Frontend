import { IReportGetBaseResponseDto } from '../types/report.dto';

export function shouldDisableReportEditOrDelete(
  row: IReportGetBaseResponseDto
): boolean {
  return row.isLocked === true;
}

export const REPORT_ROW_ACTION_DISABLE_REASON = {
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
    return 'Grant unlock is only available while the Report is locked.';
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
