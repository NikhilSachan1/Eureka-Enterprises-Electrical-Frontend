import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
  EDataType,
  EApprovalStatus,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { isPayrollLocked, toLocalCalendarDate } from '@shared/utility';
import { ILeaveGetBaseResponseDto } from '../../types/leave.dto';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

const PAYROLL_LOCKED_ROW_REASON =
  'This period is locked because payroll has already been generated.';
const BULK_PAYROLL_LOCKED_REASON =
  'Some of the selected records are locked because payroll has already been generated.';

/** Row action tooltips (single record). */
const ALREADY_CANCELLED_REASON = 'This leave is already cancelled.';
const ALREADY_APPROVED_REASON = 'This leave is already approved.';
const ALREADY_REJECTED_REASON = 'This leave is already rejected.';
const REJECTED_LEAVE_CANNOT_BE_APPROVED_REASON =
  'Rejected leave cannot be approved. Submit a new leave application to reapply.';
const CANCEL_NOT_FOR_REJECTED_REASON = 'Rejected leave cannot be cancelled.';
const CANCEL_NOT_ALLOWED_LEAVE_DATE_PAST_ROW_REASON =
  'Cancellation is not allowed because the leave period has already started or ended. Please contact HR if you need changes.';
const ACTION_NOT_ALLOWED_STATE_REASON =
  'This action is not available for the current approval status.';

/** Bulk action tooltips — match attendance / expense “some of the selected…” pattern. */
const BULK_ALREADY_CANCELLED_REASON =
  'Some of the selected leave records are already cancelled.';
const BULK_ALREADY_APPROVED_REASON =
  'Some of the selected leave records are already approved.';
const BULK_ALREADY_REJECTED_REASON =
  'Some of the selected leave records are already rejected.';
const BULK_REJECTED_LEAVE_CANNOT_BE_APPROVED_REASON =
  'Some selected records are rejected leave; they cannot be approved. Submit new leave applications to reapply.';
const BULK_CANCEL_NOT_FOR_REJECTED_REASON =
  'Some of the selected leave records are rejected and cannot be cancelled.';
const BULK_CANCEL_LEAVE_DATE_PAST_REASON =
  'Some selected records cannot be cancelled because the leave period has already started or ended. Contact HR if needed.';
const BULK_ACTION_NOT_ALLOWED_STATE_REASON =
  'Some of the selected leave records cannot receive this action in their current status.';

/**
 * Pending → Approve, Reject, Cancel.
 * Approved → Reject, Cancel (not Approve).
 * Rejected → none (reapply with a new leave application).
 * Cancelled → none.
 * Cancel → not allowed if the leave start date is before today (local) — contact HR.
 * Payroll locked on from/to date → all actions off.
 */
function rowApprovalLower(row: ILeaveGetBaseResponseDto): string {
  return row.approvalStatus?.toLowerCase() ?? '';
}

function isLeavePayrollLocked(row: ILeaveGetBaseResponseDto): boolean {
  return isPayrollLocked(row.fromDate) || isPayrollLocked(row.toDate);
}

/** True when the leave’s first day is strictly before today (local calendar) — cancellation blocked (HR policy). */
function isLeaveStartDateBeforeToday(row: ILeaveGetBaseResponseDto): boolean {
  const from = toLocalCalendarDate(row.fromDate);
  if (!from) {
    return false;
  }
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  return from.getTime() <= startOfToday.getTime();
}

function shouldDisableLeaveApprove(row: ILeaveGetBaseResponseDto): boolean {
  if (isLeavePayrollLocked(row)) {
    return true;
  }
  const s = rowApprovalLower(row);
  if (
    s === EApprovalStatus.CANCELLED ||
    s === EApprovalStatus.APPROVED ||
    s === EApprovalStatus.REJECTED
  ) {
    return true;
  }
  if (s === EApprovalStatus.PENDING) {
    return false;
  }
  return true;
}

function approveDisableReasonWithoutPayroll(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED) {
    return ALREADY_CANCELLED_REASON;
  }
  if (s === EApprovalStatus.APPROVED) {
    return ALREADY_APPROVED_REASON;
  }
  if (s === EApprovalStatus.REJECTED) {
    return REJECTED_LEAVE_CANNOT_BE_APPROVED_REASON;
  }
  if (s === EApprovalStatus.PENDING) {
    return undefined;
  }
  return ACTION_NOT_ALLOWED_STATE_REASON;
}

function getLeaveApproveDisableReason(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  if (isLeavePayrollLocked(row)) {
    return PAYROLL_LOCKED_ROW_REASON;
  }
  return approveDisableReasonWithoutPayroll(row);
}

function shouldDisableLeaveReject(row: ILeaveGetBaseResponseDto): boolean {
  if (isLeavePayrollLocked(row)) {
    return true;
  }
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED || s === EApprovalStatus.REJECTED) {
    return true;
  }
  if (s === EApprovalStatus.PENDING || s === EApprovalStatus.APPROVED) {
    return false;
  }
  return true;
}

function rejectDisableReasonWithoutPayroll(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED) {
    return ALREADY_CANCELLED_REASON;
  }
  if (s === EApprovalStatus.REJECTED) {
    return ALREADY_REJECTED_REASON;
  }
  if (s === EApprovalStatus.PENDING || s === EApprovalStatus.APPROVED) {
    return undefined;
  }
  return ACTION_NOT_ALLOWED_STATE_REASON;
}

function getLeaveRejectDisableReason(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  if (isLeavePayrollLocked(row)) {
    return PAYROLL_LOCKED_ROW_REASON;
  }
  return rejectDisableReasonWithoutPayroll(row);
}

function shouldDisableLeaveCancel(row: ILeaveGetBaseResponseDto): boolean {
  if (isLeavePayrollLocked(row)) {
    return true;
  }
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED || s === EApprovalStatus.REJECTED) {
    return true;
  }
  if (s === EApprovalStatus.PENDING || s === EApprovalStatus.APPROVED) {
    return isLeaveStartDateBeforeToday(row);
  }
  return true;
}

function cancelDisableReasonWithoutPayroll(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED) {
    return ALREADY_CANCELLED_REASON;
  }
  if (s === EApprovalStatus.REJECTED) {
    return CANCEL_NOT_FOR_REJECTED_REASON;
  }
  if (s === EApprovalStatus.PENDING || s === EApprovalStatus.APPROVED) {
    if (isLeaveStartDateBeforeToday(row)) {
      return CANCEL_NOT_ALLOWED_LEAVE_DATE_PAST_ROW_REASON;
    }
    return undefined;
  }
  return ACTION_NOT_ALLOWED_STATE_REASON;
}

function getLeaveCancelDisableReason(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  if (isLeavePayrollLocked(row)) {
    return PAYROLL_LOCKED_ROW_REASON;
  }
  return cancelDisableReasonWithoutPayroll(row);
}

function getBulkApproveDisableReason(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  if (isLeavePayrollLocked(row)) {
    return BULK_PAYROLL_LOCKED_REASON;
  }
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED) {
    return BULK_ALREADY_CANCELLED_REASON;
  }
  if (s === EApprovalStatus.APPROVED) {
    return BULK_ALREADY_APPROVED_REASON;
  }
  if (s === EApprovalStatus.REJECTED) {
    return BULK_REJECTED_LEAVE_CANNOT_BE_APPROVED_REASON;
  }
  if (s === EApprovalStatus.PENDING) {
    return undefined;
  }
  return BULK_ACTION_NOT_ALLOWED_STATE_REASON;
}

function getBulkRejectDisableReason(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  if (isLeavePayrollLocked(row)) {
    return BULK_PAYROLL_LOCKED_REASON;
  }
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED) {
    return BULK_ALREADY_CANCELLED_REASON;
  }
  if (s === EApprovalStatus.REJECTED) {
    return BULK_ALREADY_REJECTED_REASON;
  }
  if (s === EApprovalStatus.PENDING || s === EApprovalStatus.APPROVED) {
    return undefined;
  }
  return BULK_ACTION_NOT_ALLOWED_STATE_REASON;
}

function getBulkCancelDisableReason(
  row: ILeaveGetBaseResponseDto
): string | undefined {
  if (isLeavePayrollLocked(row)) {
    return BULK_PAYROLL_LOCKED_REASON;
  }
  const s = rowApprovalLower(row);
  if (s === EApprovalStatus.CANCELLED) {
    return BULK_ALREADY_CANCELLED_REASON;
  }
  if (s === EApprovalStatus.REJECTED) {
    return BULK_CANCEL_NOT_FOR_REJECTED_REASON;
  }
  if (s === EApprovalStatus.PENDING || s === EApprovalStatus.APPROVED) {
    if (isLeaveStartDateBeforeToday(row)) {
      return BULK_CANCEL_LEAVE_DATE_PAST_REASON;
    }
    return undefined;
  }
  return BULK_ACTION_NOT_ALLOWED_STATE_REASON;
}

export const LEAVE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No leave record found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any leave yet. Please add a leave first.",
};

export const LEAVE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] = [
  {
    field: 'employeeName',
    header: 'Employee Name',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'employeeCode' },
    showImage: true,
    dummyImageField: 'employeeName',
    primaryFieldHighlight: true,
    serverSideFilterAndSortConfig: {
      sortField: 'fullName',
      filterField: 'employeeName',
    },
    permission: [APP_PERMISSION.UI.LEAVE.TABLE_EMPLOYEE_NAME],
  },
  {
    field: 'leaveDate',
    header: 'Leave Date',
    bodyTemplate: EDataType.RANGE,
    dataType: EDataType.DATE,
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT,
    serverSideFilterAndSortConfig: {
      sortField: 'fromDate',
      filterField: 'leaveDate',
    },
  },
  {
    field: 'reason',
    header: 'Reason',
    bodyTemplate: EDataType.TEXT_WITH_READ_MORE,
    showSort: false,
  },
  {
    field: 'approvalStatus',
    header: 'Approval Status',
    bodyTemplate: EDataType.STATUS,
    serverSideFilterAndSortConfig: {
      filterField: 'approvalStatus',
    },
    showSort: false,
  },
];

export const LEAVE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ILeaveGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Leave Details',
    permission: [APP_PERMISSION.LEAVE.VIEW_DETAIL],
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Leave',
    permission: [APP_PERMISSION.LEAVE.APPROVE],
    disableWhen: shouldDisableLeaveApprove,
    disableReason: getLeaveApproveDisableReason,
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Leave',
    permission: [APP_PERMISSION.LEAVE.REJECT],
    disableWhen: shouldDisableLeaveReject,
    disableReason: getLeaveRejectDisableReason,
  },
  {
    ...COMMON_ROW_ACTIONS.CANCEL,
    tooltip: 'Cancel Leave',
    permission: [APP_PERMISSION.LEAVE.CANCEL],
    disableWhen: shouldDisableLeaveCancel,
    disableReason: getLeaveCancelDisableReason,
  },
];

export const LEAVE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<ILeaveGetBaseResponseDto>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Selected Leave',
    permission: [APP_PERMISSION.LEAVE.APPROVE],
    disableWhen: shouldDisableLeaveApprove,
    disableReason: getBulkApproveDisableReason,
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject Selected Leave',
    permission: [APP_PERMISSION.LEAVE.REJECT],
    disableWhen: shouldDisableLeaveReject,
    disableReason: getBulkRejectDisableReason,
  },
  {
    ...COMMON_BULK_ACTIONS.CANCEL,
    tooltip: 'Cancel Selected Leave',
    permission: [APP_PERMISSION.LEAVE.CANCEL],
    disableWhen: shouldDisableLeaveCancel,
    disableReason: getBulkCancelDisableReason,
  },
];

export const LEAVE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<ILeaveGetBaseResponseDto> =
  {
    tableConfig: LEAVE_TABLE_CONFIG,
    headers: LEAVE_TABLE_HEADER_CONFIG,
    rowActions: LEAVE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: LEAVE_TABLE_BULK_ACTIONS_CONFIG,
  };
