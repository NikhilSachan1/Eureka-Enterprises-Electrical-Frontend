import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
  EDataType,
  EButtonActionType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { COMMON_BULK_ACTIONS, COMMON_ROW_ACTIONS } from '@shared/config';
import { IAttendanceGetResponseDto } from '../../types/attendance.dto';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

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
      field: 'siteLocation',
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

export const ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] =
  [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Attendance Details',
      permission: [APP_PERMISSION.ATTENDANCE.VIEW_DETAIL],
    },
    {
      id: EButtonActionType.REGULARIZE,
      tooltip: 'Regularize Attendance',
      permission: [APP_PERMISSION.ATTENDANCE.REGULARIZE],
    },
    {
      ...COMMON_ROW_ACTIONS.APPROVE,
      tooltip: 'Approve Attendance',
      permission: [APP_PERMISSION.ATTENDANCE.APPROVE],
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject Attendance',
      permission: [APP_PERMISSION.ATTENDANCE.REJECT],
    },
  ];

export const ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG: Partial<ITableActionConfig>[] =
  [
    {
      ...COMMON_BULK_ACTIONS.APPROVE,
      tooltip: 'Approve Selected Attendance',
      permission: [APP_PERMISSION.ATTENDANCE.APPROVE],
    },
    {
      ...COMMON_BULK_ACTIONS.REJECT,
      tooltip: 'Reject Selected Attendance',
      permission: [APP_PERMISSION.ATTENDANCE.REJECT],
    },
  ];

export const ATTENDANCE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IAttendanceGetResponseDto> =
  {
    tableConfig: ATTENDANCE_TABLE_CONFIG,
    headers: ATTENDANCE_TABLE_HEADER_CONFIG,
    rowActions: ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG,
  };
