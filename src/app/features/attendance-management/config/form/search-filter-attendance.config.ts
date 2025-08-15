import {
  APPROVAL_STATUS_DATA,
  ATTENDANCE_STATUS_DATA,
  EMPLOYEE_NAME_DATA,
  EMPLOYEE_STATUS_DATA,
} from '@shared/config/static-data.config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity, EDateSelectionMode, EFieldType } from '@shared/types';

const SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  employeeStatus: {
    fieldType: EFieldType.Select,
    id: 'employeeStatus',
    fieldName: 'employeeStatus',
    label: 'Employee Status',
    selectConfig: {
      optionsDropdown: EMPLOYEE_STATUS_DATA,
      haveFilter: false,
    },
  },
  employeeName: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    multiSelectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
  },
  attendanceDate: {
    fieldType: EFieldType.Date,
    id: 'attendanceDate',
    fieldName: 'attendanceDate',
    label: 'Attendance Date',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
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
  },
  search: {
    fieldType: EFieldType.Text,
    id: 'search',
    fieldName: 'search',
    label: 'Search',
  },
};

const SEARCH_FILTER_ATTENDANCE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset filter',
    icon: 'pi pi-times',
  },
  submit: {
    type: 'submit',
    label: 'Search',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Apply filter',
    icon: 'pi pi-search',
  },
};

export const SEARCH_FILTER_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: SEARCH_FILTER_ATTENDANCE_FORM_FIELDS_CONFIG,
  buttons: SEARCH_FILTER_ATTENDANCE_FORM_BUTTONS_CONFIG,
};
