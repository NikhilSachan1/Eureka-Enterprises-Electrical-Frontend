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
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { IAttendanceGetBaseResponseDto } from '../../types/attendance.dto';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import {
  isNoAttendanceNotCheckedInWithNA,
  isRegularizeDisabledForTodayBeforeShiftEnd,
} from '../../utils';
import { isPayrollLocked } from '@shared/utility';

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
    disableWhen: isNoAttendanceNotCheckedInWithNA,
  },
  {
    id: EButtonActionType.REGULARIZE,
    tooltip: 'Regularize Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.REGULARIZE],
    disableWhen: (row: IAttendanceGetBaseResponseDto) =>
      isNoAttendanceNotCheckedInWithNA(row) ||
      isRegularizeDisabledForTodayBeforeShiftEnd(row) ||
      isPayrollLocked(row.attendanceDate),
  },
  {
    ...COMMON_ROW_ACTIONS.APPROVE,
    tooltip: 'Approve Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.APPROVE],
    // disableWhen: (row: IAttendanceGetBaseResponseDto) =>
    //   isNoAttendanceNotCheckedInWithNA(row) ||
    //   row.approvalStatus === EApprovalStatus.APPROVED ||
    //   row.approvalStatus === EApprovalStatus.NOT_APPLICABLE ||
    //   isPayrollLocked(row.attendanceDate),
  },
  {
    ...COMMON_ROW_ACTIONS.REJECT,
    tooltip: 'Reject Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.REJECT],
    disableWhen: (row: IAttendanceGetBaseResponseDto) =>
      isNoAttendanceNotCheckedInWithNA(row) ||
      row.approvalStatus === EApprovalStatus.REJECTED ||
      row.approvalStatus === EApprovalStatus.NOT_APPLICABLE ||
      isPayrollLocked(row.attendanceDate),
  },
];

export const ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG: Partial<
  ITableActionConfig<IAttendanceGetBaseResponseDto>
>[] = [
  {
    ...COMMON_BULK_ACTIONS.APPROVE,
    tooltip: 'Approve Selected Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.APPROVE],
    disableWhen: (row: IAttendanceGetBaseResponseDto) =>
      isPayrollLocked(row.attendanceDate),
  },
  {
    ...COMMON_BULK_ACTIONS.REJECT,
    tooltip: 'Reject Selected Attendance',
    permission: [APP_PERMISSION.ATTENDANCE.REJECT],
    disableWhen: (row: IAttendanceGetBaseResponseDto) =>
      isPayrollLocked(row.attendanceDate),
  },
];

export const ATTENDANCE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IAttendanceGetBaseResponseDto> =
  {
    tableConfig: ATTENDANCE_TABLE_CONFIG,
    headers: ATTENDANCE_TABLE_HEADER_CONFIG,
    rowActions: ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG,
  };
