import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
  ETableBodyTemplate,
  ETableDataType,
  ETableFilterMatchMode,
  ETableSearchInputType,
  EButtonActionType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import {
  COMMON_BULK_ACTIONS,
  COMMON_ROW_ACTIONS,
  MATCH_MODE_OPTIONS,
} from '@shared/config';
import { IAttendanceGetResponseDto } from '../../types/attendance.dto';
import {
  getDataFromArrayOfObjects,
  transformDateRangeToSplitDates,
} from '@shared/utility';
import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
} from '@shared/config/static-data.config';

export const ATTENDANCE_TABLE_CONFIG: Partial<IDataTableConfig> = {
  globalFilterFields: [
    'employeeName',
    'attendanceDate',
    'siteLocation',
    'attendanceStatus',
    'approvalStatus',
    'clientName',
    'locationName',
  ],
  emptyMessage: 'No attendance found.',
  emptyMessageIcon: ICONS.COMMON.INFO_CIRCLE,
  emptyMessageDescription:
    "You don't have any attendance yet. Please add a attendance first.",
};

export const ATTENDANCE_TABLE_HEADER_CONFIG: Partial<IDataTableHeaderConfig>[] =
  [
    {
      field: 'employeeName',
      header: 'Employee Name',
      bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
      textWithSubtitleAndImageConfig: {
        secondaryField: 'employeeCode',
        showImage: true,
        dummyImageField: 'employeeName',
        primaryFieldHighlight: true,
      },
      serverSideFilterAndSortConfig: {
        sortField: 'USER_NAME',
        filterField: 'userIds',
      },
      clientSideFilterConfig: {
        filterField: 'employeeId',
        placeholder: 'Search Employee Name',
      },
    },
    {
      field: 'attendanceDate',
      header: 'Attendance Date',
      bodyTemplate: ETableBodyTemplate.DATE,
      dataType: ETableDataType.DATE,
      serverSideFilterAndSortConfig: {
        sortField: 'ATTENDANCE_DATE',
        filterField: 'attendanceDate',
        distribute: {
          startDate: 'startDate',
          endDate: 'endDate',
        },
        transform: transformDateRangeToSplitDates,
      },
      clientSideFilterConfig: {
        filterField: 'attendanceDate',
        placeholder: 'Search By Attendance Date',
        matchModeOptions: MATCH_MODE_OPTIONS.date,
        defaultMatchMode: ETableFilterMatchMode.EQUALS,
      },
    },
    {
      field: 'siteLocation',
      header: 'Site Location / Client Name',
      bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
      textWithSubtitleAndImageConfig: {
        secondaryField: 'clientName',
        primaryFieldLabel: 'Site Location',
        secondaryFieldLabel: 'Client Name',
      },
      clientSideFilterConfig: {
        filterField: 'siteLocation',
        placeholder: 'Search By Site Location / Client Name',
      },
      showSort: false,
    },
    {
      field: 'attendanceStatus',
      header: 'Attendance Status',
      bodyTemplate: ETableBodyTemplate.STATUS,
      serverSideFilterAndSortConfig: {
        sortField: 'STATUS',
        filterField: 'statuses',
      },
      clientSideFilterConfig: {
        filterField: 'attendanceStatus',
        searchInputType: ETableSearchInputType.DROPDOWN,
        filterDropdownOptions: getDataFromArrayOfObjects(
          ATTENDANCE_STATUS_DATA,
          'label'
        ),
        placeholder: 'Search By Attendance Status',
        matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
        defaultMatchMode: ETableFilterMatchMode.EQUALS,
      },
    },
    {
      field: 'approvalStatus',
      header: 'Approval Status',
      bodyTemplate: ETableBodyTemplate.STATUS,
      serverSideFilterAndSortConfig: {
        filterField: 'approvalStatuses',
      },
      clientSideFilterConfig: {
        filterField: 'approvalStatus',
        searchInputType: ETableSearchInputType.DROPDOWN,
        filterDropdownOptions: getDataFromArrayOfObjects(
          APPROVAL_STATUS_DATA,
          'label'
        ),
        placeholder: 'Search By Approval Status',
        matchModeOptions: MATCH_MODE_OPTIONS.dropdown,
        defaultMatchMode: ETableFilterMatchMode.EQUALS,
      },
      showSort: false,
    },
  ];

export const ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG: Partial<ITableActionConfig>[] =
  [
    {
      ...COMMON_ROW_ACTIONS.VIEW,
      tooltip: 'View Attendance Details',
    },
    {
      id: EButtonActionType.REGULARIZE,
      icon: ICONS.ATTENDANCE.REGULARIZE,
      tooltip: 'Regularize Attendance',
    },
    {
      ...COMMON_ROW_ACTIONS.APPROVE,
      tooltip: 'Approve Attendance',
    },
    {
      ...COMMON_ROW_ACTIONS.REJECT,
      tooltip: 'Reject Attendance',
    },
  ];

export const ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG: Partial<ITableActionConfig>[] =
  [
    {
      ...COMMON_BULK_ACTIONS.APPROVE,
      tooltip: 'Approve Selected Attendance',
    },
    {
      ...COMMON_BULK_ACTIONS.REJECT,
      tooltip: 'Reject Selected Attendance',
    },
  ];

export const ATTENDANCE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IAttendanceGetResponseDto> =
  {
    tableConfig: ATTENDANCE_TABLE_CONFIG,
    headers: ATTENDANCE_TABLE_HEADER_CONFIG,
    rowActions: ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG,
  };
