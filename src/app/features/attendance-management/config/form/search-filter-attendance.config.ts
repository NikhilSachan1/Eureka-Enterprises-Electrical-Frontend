import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
} from '@shared/config/static-data.config';
import {
  EFieldType,
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
    },
    attendanceStatus: {
      fieldType: EFieldType.MultiSelect,
      id: 'attendanceStatus',
      fieldName: 'attendanceStatus',
      label: 'Attendance Status',
      multiSelectConfig: {
        optionsDropdown: filterOptionsByIncludeExclude(
          ATTENDANCE_STATUS_DATA,
          [],
          ['checked_out']
        ),
        haveFilter: false,
        showToggleAll: false,
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    approvalStatus: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
      multiSelectConfig: {
        optionsDropdown: filterOptionsByIncludeExclude(
          APPROVAL_STATUS_DATA,
          [],
          ['cancelled']
        ),
        haveFilter: false,
        showToggleAll: false,
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
