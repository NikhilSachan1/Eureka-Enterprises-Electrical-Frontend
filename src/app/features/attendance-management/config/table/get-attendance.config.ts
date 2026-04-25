import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
  EDataType,
  EButtonActionType,
  EApprovalStatus,
  EEntryType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import {
  COMMON_BULK_ACTIONS,
  COMMON_ROW_ACTIONS,
  SHIFT_DATA,
} from '@shared/config';
import { isPayrollLocked, toLocalCalendarDate } from '@shared/utility';
import { IAttendanceGetBaseResponseDto } from '../../types/attendance.dto';
import { EAttendanceStatus } from '../../types/attendance.enum';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

// ─── Predicates (shared) ─────────────────────────────────────────────────────

/** Not checked in yet, or approval does not apply — blocks approve/reject (and view/regularize except on holiday/leave). */
function isAttendanceNotMarkedYet(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    row.status === EAttendanceStatus.NOT_CHECKED_IN_YET ||
    row.approvalStatus === EApprovalStatus.NOT_APPLICABLE
  );
}

/**
 * When both check-in and check-out are missing but status is already set to
 * something other than "not checked in yet", approval actions should be blocked
 * and only regularization should be allowed.
 */
function isRegularizationOnlyCase(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    !row.checkInTime &&
    !row.checkOutTime &&
    row.status !== EAttendanceStatus.NOT_CHECKED_IN_YET
  );
}

function isAttendanceHoliday(row: IAttendanceGetBaseResponseDto): boolean {
  return row.status === EAttendanceStatus.HOLIDAY;
}

function isAttendanceLeave(row: IAttendanceGetBaseResponseDto): boolean {
  return row.status === EAttendanceStatus.LEAVE;
}

/** Holiday or leave: approve/reject disabled; view/regularize use separate “not marked” rules. */
function isHolidayOrLeave(row: IAttendanceGetBaseResponseDto): boolean {
  return isAttendanceHoliday(row) || isAttendanceLeave(row);
}

/**
 * View / regularize on holidays and leave days: do not treat as “not marked yet”
 * (so those actions can still run when applicable).
 */
function isAttendanceNotMarkedYetForViewRegularize(
  row: IAttendanceGetBaseResponseDto
): boolean {
  return isAttendanceNotMarkedYet(row) && !isHolidayOrLeave(row);
}

function isApprovalAlreadyApproved(
  row: IAttendanceGetBaseResponseDto
): boolean {
  const s = row.approvalStatus?.toLowerCase() ?? '';
  return s === EApprovalStatus.APPROVED;
}

function isApprovalAlreadyRejected(
  row: IAttendanceGetBaseResponseDto
): boolean {
  const s = row.approvalStatus?.toLowerCase() ?? '';
  return s === EApprovalStatus.REJECTED;
}

// ─── Row tooltips: View ──────────────────────────────────────────────────────

const VIEW_DISABLED_NOT_MARKED_REASON =
  'View is available only after the employee checks in and attendance is recorded for the day.';

// ─── Row tooltips: Regularize ────────────────────────────────────────────────

const REGULARIZE_DISABLED_NOT_MARKED_REASON =
  'Regularization is available only after the employee checks in and attendance is recorded.';
const REGULARIZE_DISABLED_PAYROLL_LOCKED_REASON =
  'Regularization is not available because payroll has already been processed for this period.';
const REGULARIZE_DISABLED_BEFORE_SHIFT_END_REASON = (endTime: string): string =>
  `Regularization will be available after the shift ends (${endTime}).`;

// ─── Row tooltips: Approve ───────────────────────────────────────────────────

const APPROVE_DISABLED_ON_HOLIDAY_REASON =
  'Approval is not allowed on scheduled holidays.';
const APPROVE_DISABLED_ON_LEAVE_REASON =
  'Approval is not allowed for leave days.';
const APPROVE_DISABLED_NOT_MARKED_REASON =
  'Approval is available only after the employee checks in.';
const APPROVE_DISABLED_REGULARIZATION_ONLY_REASON =
  'Employee did not check in for this day, so only regularization is allowed.';
const APPROVE_DISABLED_REGULARIZED_REASON =
  'Approval is not allowed for attendance recorded through regularization.';
const APPROVE_DISABLED_FORCED_REASON =
  'Approval is not allowed for forced attendance entries.';
const APPROVE_DISABLED_PAYROLL_LOCKED_REASON =
  'Approval is not available because payroll has already been processed for this period.';
const APPROVE_DISABLED_ALREADY_APPROVED_REASON =
  'This attendance has already been approved.';

// ─── Row tooltips: Reject ───────────────────────────────────────────────────

const REJECT_DISABLED_ON_HOLIDAY_REASON =
  'Rejection is not allowed on scheduled holidays.';
const REJECT_DISABLED_ON_LEAVE_REASON =
  'Rejection is not allowed for leave days.';
const REJECT_DISABLED_NOT_MARKED_REASON =
  'Rejection is available only after the employee checks in.';
const REJECT_DISABLED_REGULARIZATION_ONLY_REASON =
  'Employee did not check in for this day, so only regularization is allowed.';
const REJECT_DISABLED_REGULARIZED_REASON =
  'Rejection is not allowed for attendance recorded through regularization.';
const REJECT_DISABLED_FORCED_REASON =
  'Rejection is not allowed for forced attendance entries.';
const REJECT_DISABLED_PAYROLL_LOCKED_REASON =
  'Rejection is not available because payroll has already been processed for this period.';
const REJECT_DISABLED_ALREADY_REJECTED_REASON =
  'This attendance has already been rejected.';

// ─── Bulk tooltips: Approve ──────────────────────────────────────────────────

const BULK_APPROVE_DISABLED_ON_HOLIDAY_REASON =
  'Some selected records are holidays and cannot be approved.';
const BULK_APPROVE_DISABLED_ON_LEAVE_REASON =
  'Some selected records are leave days and cannot be approved.';
const BULK_APPROVE_DISABLED_NOT_MARKED_REASON =
  'Some selected records do not have a check-in and cannot be approved.';
const BULK_APPROVE_DISABLED_REGULARIZATION_ONLY_REASON =
  'Some selected records were not checked in for the day and can only be regularized.';
const BULK_APPROVE_DISABLED_REGULARIZED_REASON =
  'Some selected records are regularized and cannot be approved.';
const BULK_APPROVE_DISABLED_FORCED_REASON =
  'Some selected records are forced attendance and cannot be approved.';
const BULK_APPROVE_DISABLED_PAYROLL_LOCKED_REASON =
  'Some selected records fall in a payroll-locked period and cannot be approved.';
const BULK_APPROVE_DISABLED_ALREADY_APPROVED_REASON =
  'Some selected records are already approved.';

// ─── Bulk tooltips: Reject ───────────────────────────────────────────────────

const BULK_REJECT_DISABLED_ON_HOLIDAY_REASON =
  'Some selected records are holidays and cannot be rejected.';
const BULK_REJECT_DISABLED_ON_LEAVE_REASON =
  'Some selected records are leave days and cannot be rejected.';
const BULK_REJECT_DISABLED_NOT_MARKED_REASON =
  'Some selected records do not have a check-in and cannot be rejected.';
const BULK_REJECT_DISABLED_REGULARIZATION_ONLY_REASON =
  'Some selected records were not checked in for the day and can only be regularized.';
const BULK_REJECT_DISABLED_REGULARIZED_REASON =
  'Some selected records are regularized and cannot be rejected.';
const BULK_REJECT_DISABLED_FORCED_REASON =
  'Some selected records are forced attendance and cannot be rejected.';
const BULK_REJECT_DISABLED_PAYROLL_LOCKED_REASON =
  'Some selected records fall in a payroll-locked period and cannot be rejected.';
const BULK_REJECT_DISABLED_ALREADY_REJECTED_REASON =
  'Some selected records are already rejected.';

/** Shared priority for approve/reject disable (first match wins). */
type ApproveRejectSharedBlock =
  | 'holiday'
  | 'leave'
  | 'regularizationOnly'
  | 'notMarked'
  | 'regularized'
  | 'forced'
  | 'payrollLocked';

const ROW_APPROVE_REASON_BY_BLOCK: Record<ApproveRejectSharedBlock, string> = {
  holiday: APPROVE_DISABLED_ON_HOLIDAY_REASON,
  leave: APPROVE_DISABLED_ON_LEAVE_REASON,
  regularizationOnly: APPROVE_DISABLED_REGULARIZATION_ONLY_REASON,
  notMarked: APPROVE_DISABLED_NOT_MARKED_REASON,
  regularized: APPROVE_DISABLED_REGULARIZED_REASON,
  forced: APPROVE_DISABLED_FORCED_REASON,
  payrollLocked: APPROVE_DISABLED_PAYROLL_LOCKED_REASON,
};

const ROW_REJECT_REASON_BY_BLOCK: Record<ApproveRejectSharedBlock, string> = {
  holiday: REJECT_DISABLED_ON_HOLIDAY_REASON,
  leave: REJECT_DISABLED_ON_LEAVE_REASON,
  regularizationOnly: REJECT_DISABLED_REGULARIZATION_ONLY_REASON,
  notMarked: REJECT_DISABLED_NOT_MARKED_REASON,
  regularized: REJECT_DISABLED_REGULARIZED_REASON,
  forced: REJECT_DISABLED_FORCED_REASON,
  payrollLocked: REJECT_DISABLED_PAYROLL_LOCKED_REASON,
};

const BULK_APPROVE_REASON_BY_BLOCK: Record<ApproveRejectSharedBlock, string> = {
  holiday: BULK_APPROVE_DISABLED_ON_HOLIDAY_REASON,
  leave: BULK_APPROVE_DISABLED_ON_LEAVE_REASON,
  regularizationOnly: BULK_APPROVE_DISABLED_REGULARIZATION_ONLY_REASON,
  notMarked: BULK_APPROVE_DISABLED_NOT_MARKED_REASON,
  regularized: BULK_APPROVE_DISABLED_REGULARIZED_REASON,
  forced: BULK_APPROVE_DISABLED_FORCED_REASON,
  payrollLocked: BULK_APPROVE_DISABLED_PAYROLL_LOCKED_REASON,
};

const BULK_REJECT_REASON_BY_BLOCK: Record<ApproveRejectSharedBlock, string> = {
  holiday: BULK_REJECT_DISABLED_ON_HOLIDAY_REASON,
  leave: BULK_REJECT_DISABLED_ON_LEAVE_REASON,
  regularizationOnly: BULK_REJECT_DISABLED_REGULARIZATION_ONLY_REASON,
  notMarked: BULK_REJECT_DISABLED_NOT_MARKED_REASON,
  regularized: BULK_REJECT_DISABLED_REGULARIZED_REASON,
  forced: BULK_REJECT_DISABLED_FORCED_REASON,
  payrollLocked: BULK_REJECT_DISABLED_PAYROLL_LOCKED_REASON,
};

/**
 * Single ordered pass for the conditions that apply identically to approve and reject
 * (holiday → leave → not marked → regularized / forced → payroll locked).
 */
function getSharedApproveRejectDisableBlock(
  row: IAttendanceGetBaseResponseDto
): ApproveRejectSharedBlock | undefined {
  if (isAttendanceHoliday(row)) {
    return 'holiday';
  }
  if (isAttendanceLeave(row)) {
    return 'leave';
  }
  if (isRegularizationOnlyCase(row)) {
    return 'regularizationOnly';
  }
  if (isAttendanceNotMarkedYet(row)) {
    return 'notMarked';
  }
  if (row.attendanceType === EEntryType.REGULARIZED) {
    return 'regularized';
  }
  if (row.attendanceType === EEntryType.FORCED) {
    return 'forced';
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return 'payrollLocked';
  }
  return undefined;
}

function shouldDisableApprove(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    getSharedApproveRejectDisableBlock(row) !== undefined ||
    isApprovalAlreadyApproved(row)
  );
}

function getApproveDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  const block = getSharedApproveRejectDisableBlock(row);
  if (block !== undefined) {
    return ROW_APPROVE_REASON_BY_BLOCK[block];
  }
  if (isApprovalAlreadyApproved(row)) {
    return APPROVE_DISABLED_ALREADY_APPROVED_REASON;
  }
  return undefined;
}

function shouldDisableReject(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    getSharedApproveRejectDisableBlock(row) !== undefined ||
    isApprovalAlreadyRejected(row)
  );
}

function getRejectDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  const block = getSharedApproveRejectDisableBlock(row);
  if (block !== undefined) {
    return ROW_REJECT_REASON_BY_BLOCK[block];
  }
  if (isApprovalAlreadyRejected(row)) {
    return REJECT_DISABLED_ALREADY_REJECTED_REASON;
  }
  return undefined;
}

function getBulkApproveDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  const block = getSharedApproveRejectDisableBlock(row);
  if (block !== undefined) {
    return BULK_APPROVE_REASON_BY_BLOCK[block];
  }
  if (isApprovalAlreadyApproved(row)) {
    return BULK_APPROVE_DISABLED_ALREADY_APPROVED_REASON;
  }
  return undefined;
}

function getBulkRejectDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  const block = getSharedApproveRejectDisableBlock(row);
  if (block !== undefined) {
    return BULK_REJECT_REASON_BY_BLOCK[block];
  }
  if (isApprovalAlreadyRejected(row)) {
    return BULK_REJECT_DISABLED_ALREADY_REJECTED_REASON;
  }
  return undefined;
}

/** Same calendar day as today (local), for shift-end regularize rule. */
function isSameLocalCalendarDayAsToday(
  attendanceDate: IAttendanceGetBaseResponseDto['attendanceDate']
): boolean {
  const day = toLocalCalendarDate(attendanceDate);
  if (!day) {
    return false;
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return day.getTime() === todayStart.getTime();
}

/** Before configured shift end time on the given local day (uses {@link SHIFT_DATA.END_TIME}). */
function isNowBeforeShiftEnd(): boolean {
  const [hStr, mStr] = SHIFT_DATA.END_TIME.split(':');
  const hours = Number(hStr);
  const minutes = Number(mStr ?? 0);
  if (Number.isNaN(hours)) {
    return false;
  }
  const now = new Date();
  const shiftEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
  return now < shiftEnd;
}

type RegularizeDisableBlock = 'notMarked' | 'payrollLocked' | 'beforeShiftEnd';

function getRegularizeDisableBlock(
  row: IAttendanceGetBaseResponseDto
): RegularizeDisableBlock | undefined {
  if (isAttendanceNotMarkedYetForViewRegularize(row)) {
    return 'notMarked';
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return 'payrollLocked';
  }
  if (
    isSameLocalCalendarDayAsToday(row.attendanceDate) &&
    isNowBeforeShiftEnd()
  ) {
    return 'beforeShiftEnd';
  }
  return undefined;
}

function shouldDisableRegularize(row: IAttendanceGetBaseResponseDto): boolean {
  return getRegularizeDisableBlock(row) !== undefined;
}

function getRegularizeDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  switch (getRegularizeDisableBlock(row)) {
    case 'notMarked':
      return REGULARIZE_DISABLED_NOT_MARKED_REASON;
    case 'payrollLocked':
      return REGULARIZE_DISABLED_PAYROLL_LOCKED_REASON;
    case 'beforeShiftEnd':
      return REGULARIZE_DISABLED_BEFORE_SHIFT_END_REASON(SHIFT_DATA.END_TIME);
    default:
      return undefined;
  }
}

function getViewDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  if (isAttendanceNotMarkedYetForViewRegularize(row)) {
    return VIEW_DISABLED_NOT_MARKED_REASON;
  }
  return undefined;
}

export const ATTENDANCE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  emptyMessage: 'No attendance record found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any attendance yet. Please add a attendance first.",
};

export const ATTENDANCE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'employeeName',
      header: 'Employee Name',
      bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
      subtitle: { field: 'employeeCode' },
      showImage: true,
      dummyImageField: 'employeeName',
      primaryFieldHighlight: true,
      permission: [APP_PERMISSION.UI.ATTENDANCE.TABLE_EMPLOYEE_NAME],
      serverSideFilterAndSortConfig: {
        sortField: 'USER_NAME',
        filterField: 'employeeName',
      },
    },
    {
      field: 'attendanceDate',
      header: 'Attendance Date',
      bodyTemplate: EDataType.DATE,
      dataType: EDataType.DATE,
      serverSideFilterAndSortConfig: {
        sortField: 'ATTENDANCE_DATE',
        filterField: 'attendanceDate',
      },
    },
    {
      field: 'assignmentSnapshot',
      header: 'Assignment Details',
      customTemplateKey: 'attendanceAssignmentDetails',
      showSort: false,
    },
    {
      field: 'attendanceStatus',
      header: 'Attendance Status',
      bodyTemplate: EDataType.STATUS,
      serverSideFilterAndSortConfig: {
        sortField: 'STATUS',
        filterField: 'attendanceStatus',
      },
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

export const ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAttendanceGetBaseResponseDto>
>[] = [
  {
    ...COMMON_ROW_ACTIONS.VIEW,
    tooltip: 'View Attendance Details',
    permission: [APP_PERMISSION.ATTENDANCE.VIEW_DETAIL],
    disableWhen: isAttendanceNotMarkedYetForViewRegularize,
    disableReason: getViewDisableReason,
  },
  {
    id: EButtonActionType.REGULARIZE,
    tooltip: 'Regularize Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.REGULARIZE],
    disableWhen: shouldDisableRegularize,
    disableReason: getRegularizeDisableReason,
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.APPROVE],
    disableWhen: shouldDisableApprove,
    disableReason: getApproveDisableReason,
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.REJECT],
    disableWhen: shouldDisableReject,
    disableReason: getRejectDisableReason,
  },
];

export const ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAttendanceGetBaseResponseDto>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Selected Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.APPROVE],
    disableWhen: shouldDisableApprove,
    disableReason: getBulkApproveDisableReason,
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject Selected Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.REJECT],
    disableWhen: shouldDisableReject,
    disableReason: getBulkRejectDisableReason,
  },
];

export const ATTENDANCE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IAttendanceGetBaseResponseDto> =
  {
    tableConfig: ATTENDANCE_TABLE_CONFIG,
    headers: ATTENDANCE_TABLE_HEADER_CONFIG,
    rowActions: ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG,
  };
