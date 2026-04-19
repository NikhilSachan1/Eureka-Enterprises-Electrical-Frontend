import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
  EDataType,
  EButtonActionType,
  EApprovalStatus,
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

/** When status is not checked in yet, the employee has not marked attendance — row/bulk actions are disabled. */
function isAttendanceNotMarkedYet(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    row.status === EAttendanceStatus.NOT_CHECKED_IN_YET ||
    row.approvalStatus === EApprovalStatus.NOT_APPLICABLE
  );
}

function isAttendanceHoliday(row: IAttendanceGetBaseResponseDto): boolean {
  return row.status === EAttendanceStatus.HOLIDAY;
}

/**
 * View / regularize may run on holidays even when approval is N/A or day wasn’t “checked in”
 * (holiday rows are not treated as “not marked yet” for those actions).
 */
function isAttendanceNotMarkedYetForViewRegularize(
  row: IAttendanceGetBaseResponseDto
): boolean {
  return isAttendanceNotMarkedYet(row) && !isAttendanceHoliday(row);
}

const NOT_MARKED_ATTENDANCE_ACTION_REASON =
  'Attendance has not been marked yet. Actions are unavailable until the employee checks in.';

const ALREADY_APPROVED_REASON = 'This attendance is already approved.';
const ALREADY_REJECTED_REASON = 'This attendance is already rejected.';

/** Bulk tooltips (match expense / fuel-expense table configs: “some of the selected…”). */
const BULK_NOT_MARKED_ATTENDANCE_REASON =
  'Some of the selected attendance records have not been marked yet.';
const BULK_ALREADY_APPROVED_REASON =
  'Some of the selected attendance records are already approved.';
const BULK_ALREADY_REJECTED_REASON =
  'Some of the selected attendance records are already rejected.';

const PAYROLL_LOCKED_ROW_REASON =
  'This period is locked because payroll has already been generated.';
const PAYROLL_LOCKED_BULK_REASON =
  'Some of the selected records are locked because payroll has already been generated.';

/** Attendance row is “leave” but attendance approval is still pending — resolve leave first. */
const LEAVE_PENDING_TAKE_ACTION_ON_LEAVE_FIRST_REASON =
  'This day is on leave with approval still pending. Take action on the leave application first, then approve or reject attendance.';
const BULK_LEAVE_PENDING_TAKE_ACTION_ON_LEAVE_FIRST_REASON =
  'Some of the selected records are on leave with leave approval still pending. Take action on leave first.';

function isLeaveWithPendingAttendanceApproval(
  row: IAttendanceGetBaseResponseDto
): boolean {
  const approval = row.approvalStatus?.toLowerCase() ?? '';
  return (
    row.status === EAttendanceStatus.LEAVE &&
    approval === EApprovalStatus.PENDING
  );
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

function shouldDisableApprove(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    isAttendanceNotMarkedYet(row) ||
    isLeaveWithPendingAttendanceApproval(row) ||
    isPayrollLocked(row.attendanceDate) ||
    isApprovalAlreadyApproved(row)
  );
}

function getApproveDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  if (isAttendanceNotMarkedYet(row)) {
    return NOT_MARKED_ATTENDANCE_ACTION_REASON;
  }
  if (isLeaveWithPendingAttendanceApproval(row)) {
    return LEAVE_PENDING_TAKE_ACTION_ON_LEAVE_FIRST_REASON;
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return PAYROLL_LOCKED_ROW_REASON;
  }
  if (isApprovalAlreadyApproved(row)) {
    return ALREADY_APPROVED_REASON;
  }
  return undefined;
}

function shouldDisableReject(row: IAttendanceGetBaseResponseDto): boolean {
  return (
    isAttendanceNotMarkedYet(row) ||
    isLeaveWithPendingAttendanceApproval(row) ||
    isPayrollLocked(row.attendanceDate) ||
    isApprovalAlreadyRejected(row)
  );
}

function getRejectDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  if (isAttendanceNotMarkedYet(row)) {
    return NOT_MARKED_ATTENDANCE_ACTION_REASON;
  }
  if (isLeaveWithPendingAttendanceApproval(row)) {
    return LEAVE_PENDING_TAKE_ACTION_ON_LEAVE_FIRST_REASON;
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return PAYROLL_LOCKED_ROW_REASON;
  }
  if (isApprovalAlreadyRejected(row)) {
    return ALREADY_REJECTED_REASON;
  }
  return undefined;
}

function getBulkApproveDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  if (isAttendanceNotMarkedYet(row)) {
    return BULK_NOT_MARKED_ATTENDANCE_REASON;
  }
  if (isLeaveWithPendingAttendanceApproval(row)) {
    return BULK_LEAVE_PENDING_TAKE_ACTION_ON_LEAVE_FIRST_REASON;
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return PAYROLL_LOCKED_BULK_REASON;
  }
  if (isApprovalAlreadyApproved(row)) {
    return BULK_ALREADY_APPROVED_REASON;
  }
  return undefined;
}

function getBulkRejectDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  if (isAttendanceNotMarkedYet(row)) {
    return BULK_NOT_MARKED_ATTENDANCE_REASON;
  }
  if (isLeaveWithPendingAttendanceApproval(row)) {
    return BULK_LEAVE_PENDING_TAKE_ACTION_ON_LEAVE_FIRST_REASON;
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return PAYROLL_LOCKED_BULK_REASON;
  }
  if (isApprovalAlreadyRejected(row)) {
    return BULK_ALREADY_REJECTED_REASON;
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

/** Regularize: not marked yet, payroll locked, or same-day row before shift end time from static config. */
function shouldDisableRegularize(row: IAttendanceGetBaseResponseDto): boolean {
  if (isAttendanceNotMarkedYetForViewRegularize(row)) {
    return true;
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return true;
  }
  return (
    isSameLocalCalendarDayAsToday(row.attendanceDate) && isNowBeforeShiftEnd()
  );
}

function getRegularizeDisableReason(
  row: IAttendanceGetBaseResponseDto
): string | undefined {
  if (isAttendanceNotMarkedYetForViewRegularize(row)) {
    return NOT_MARKED_ATTENDANCE_ACTION_REASON;
  }
  if (isPayrollLocked(row.attendanceDate)) {
    return PAYROLL_LOCKED_ROW_REASON;
  }
  if (
    isSameLocalCalendarDayAsToday(row.attendanceDate) &&
    isNowBeforeShiftEnd()
  ) {
    return `Regularize is available after shift ends (${SHIFT_DATA.END_TIME}).`;
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
    disableReason: row =>
      isAttendanceNotMarkedYetForViewRegularize(row)
        ? NOT_MARKED_ATTENDANCE_ACTION_REASON
        : undefined,
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
