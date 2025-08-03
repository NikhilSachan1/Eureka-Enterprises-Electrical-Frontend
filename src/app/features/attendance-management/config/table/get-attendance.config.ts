import {
  IRowActionConfig,
  IDataTableConfig,
  IDataTableHeaderConfig,
  IEnhancedTableConfig,
  IBulkActionConfig,
} from '@shared/models';
import {
  ERowActionType,
  ETableBodyTemplate,
  EButtonSeverity,
  EBulkActionType,
  ETableDataType,
  ETableFilterMatchMode,
  ETableSearchInputType,
} from '@shared/types';
import { ICONS } from '@shared/constants';
import { MATCH_MODE_OPTIONS } from '@shared/config';
import { IAttendanceGetResponseDto } from '../../types/attendance.dto';
import { getDataFromArrayOfObjects } from '@shared/utility';
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
      filterConfig: {
        filterField: 'employeeName',
        placeholder: 'Search Employee Name',
      },
    },
    {
      field: 'attendanceDate',
      header: 'Attendance Date',
      bodyTemplate: ETableBodyTemplate.DATE,
      dataType: ETableDataType.DATE,
      showFilter: true,
      showSort: true,
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
    },
  ];

export const ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG: Partial<IRowActionConfig>[] =
  [
    {
      id: ERowActionType.VIEW,
      icon: ICONS.COMMON.VIEW,
      tooltip: 'View Details',
      severity: EButtonSeverity.INFO,
    },
    {
      id: ERowActionType.REGULARIZE,
      icon: ICONS.ATTENDANCE.REGULARIZE,
      tooltip: 'Regularize Attendance',
      severity: EButtonSeverity.WARNING,
    },
    {
      id: ERowActionType.APPROVE,
      icon: ICONS.ACTIONS.CHECK,
      tooltip: 'Approve Attendance',
      severity: EButtonSeverity.SUCCESS,
    },
    {
      id: ERowActionType.REJECT,
      icon: ICONS.ACTIONS.TIMES,
      tooltip: 'Reject Attendance',
      severity: EButtonSeverity.DANGER,
    },
  ];

export const ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG: Partial<IBulkActionConfig>[] =
  [
    {
      id: EBulkActionType.APPROVE,
      label: 'Approve',
      icon: ICONS.ACTIONS.CHECK,
      severity: EButtonSeverity.SUCCESS,
    },
    {
      id: EBulkActionType.REJECT,
      label: 'Reject',
      icon: ICONS.ACTIONS.TIMES,
      severity: EButtonSeverity.DANGER,
    },
  ];

export const ATTENDANCE_TABLE_ENHANCED_CONFIG: IEnhancedTableConfig<IAttendanceGetResponseDto> =
  {
    tableConfig: ATTENDANCE_TABLE_CONFIG,
    headers: ATTENDANCE_TABLE_HEADER_CONFIG,
    rowActions: ATTENDANCE_TABLE_ROW_ACTIONS_CONFIG,
    bulkActions: ATTENDANCE_TABLE_BULK_ACTIONS_CONFIG,
  };
