import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
} from '@shared/config/static-data.config';
import {
  EApprovalStatus,
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { filterOptionsByIncludeExclude } from '@shared/utility';

const SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    employeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    },
    attendanceDate: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      label: 'Attendance Date',
      fieldName: 'attendanceDate',
    },
    attendanceStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'attendanceStatus',
      fieldName: 'attendanceStatus',
      label: 'Attendance Status',
      multiSelectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
        optionsDropdown: filterOptionsByIncludeExclude(
          ATTENDANCE_STATUS_DATA,
          [],
          [EAttendanceStatus.CHECKED_OUT]
        ),
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    approvalStatus: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
      multiSelectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
        optionsDropdown: filterOptionsByIncludeExclude(
          APPROVAL_STATUS_DATA,
          [],
          [EApprovalStatus.CANCELLED]
        ),
      },
    },
    globalSearch: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    },
  };

const SEARCH_FILTER_ATTENDANCE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_ATTENDANCE_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_ATTENDANCE_FORM_BUTTONS_CONFIG,
  };
