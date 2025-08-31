import {
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  ITableActionConfig,
} from '@shared/models';
import {
  ETableActionType,
  ETableBodyTemplate,
  ETableDataType,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import {
  COMMON_BULK_ACTIONS,
  COMMON_ROW_ACTIONS,
  MATCH_MODE_OPTIONS,
} from '@shared/config';
import { IAttendanceGetResponseDto } from '../../types/attendance.dto';
import { getDataFromArrayOfObjects } from '@shared/utility';
import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
} from '@shared/config/static-data.config';
import { APP_CONFIG } from '@core/config';
import { DatePipe } from '@angular/common';

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
      filterConfig: {
        filterField: 'employeeId',
        placeholder: 'Search Employee Name',
      },
    },
    {
      field: 'attendanceDate',
      header: 'Attendance Date',
      bodyTemplate: ETableBodyTemplate.DATE,
      dataType: ETableDataType.DATE,
      filterConfig: {
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
      filterConfig: {
        filterField: 'siteLocation',
        placeholder: 'Search By Site Location / Client Name',
      },
      showSort: false,
    },
    {
      field: 'attendanceStatus',
      header: 'Attendance Status',
      bodyTemplate: ETableBodyTemplate.STATUS,
      filterConfig: {
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
      filterConfig: {
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
      id: ETableActionType.REGULARIZE,
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

export const ATTENDANCE_TABLE_STATE_MAPPING = {
  employeeName: {
    sortField: 'USER_NAME',
  },
  attendanceDate: {
    sortField: 'ATTENDANCE_DATE',
    filterField: 'attendanceDate',
    distribute: {
      startDate: 'startDate',
      endDate: 'endDate',
    },
    transform: (value: unknown): { startDate?: string; endDate?: string } => {
      const [startDateObj, endDateObj] = value as Date[];
      const datePipe = new DatePipe('en-US');
      const dateFormat = APP_CONFIG.DATE_FORMATS.API; // Use format from constant

      return {
        startDate: startDateObj
          ? (datePipe.transform(startDateObj, dateFormat) ?? undefined)
          : undefined,
        endDate: endDateObj
          ? (datePipe.transform(endDateObj, dateFormat) ?? undefined)
          : undefined,
      };
    },
  },
  attendanceStatus: {
    sortField: 'STATUS',
    filterField: 'statuses',
  },
  employeeId: {
    filterField: 'userIds',
  },
  approvalStatus: {
    filterField: 'approvalStatuses',
  },
};
