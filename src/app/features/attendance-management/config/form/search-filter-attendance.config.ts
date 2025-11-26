import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
  EMPLOYEE_NAME_DATA,
  EMPLOYEE_STATUS_DATA,
} from '@shared/config/static-data.config';
import {
  EDateSelectionMode,
  EFieldType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    employeeStatus: {
      fieldType: EFieldType.MultiSelect,
      id: 'employeeStatus',
      fieldName: 'employeeStatus',
      label: 'Employee Status',
      multiSelectConfig: {
        optionsDropdown: EMPLOYEE_STATUS_DATA,
        haveFilter: false,
        showToggleAll: false,
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    employeeId: {
      fieldType: EFieldType.MultiSelect,
      id: 'employeeName',
      fieldName: 'employeeId',
      label: 'Employee Name',
      multiSelectConfig: {
        optionsDropdown: EMPLOYEE_NAME_DATA,
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    attendanceDate: {
      fieldType: EFieldType.Date,
      id: 'attendanceDate',
      fieldName: 'attendanceDate',
      label: 'Attendance Date',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
      },
      matchmode: ETableFilterMatchMode.BETWEEN,
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
      fieldType: EFieldType.MultiSelect,
      id: 'approvalStatus',
      fieldName: 'approvalStatus',
      label: 'Approval Status',
      multiSelectConfig: {
        optionsDropdown: APPROVAL_STATUS_DATA,
        haveFilter: false,
        showToggleAll: false,
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    globalSearch: {
      fieldType: EFieldType.Text,
      id: 'globalSearch',
      fieldName: 'globalSearch',
      label: 'Search',
      matchmode: ETableFilterMatchMode.CONTAINS,
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
