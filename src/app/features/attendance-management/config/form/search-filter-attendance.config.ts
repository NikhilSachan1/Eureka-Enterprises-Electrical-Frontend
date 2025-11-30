import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { ATTENDANCE_STATUS_DATA } from '@shared/config/static-data.config';
import {
  EFieldType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

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
        optionsDropdown: ATTENDANCE_STATUS_DATA,
        haveFilter: false,
        showToggleAll: false,
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    approvalStatus: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
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
