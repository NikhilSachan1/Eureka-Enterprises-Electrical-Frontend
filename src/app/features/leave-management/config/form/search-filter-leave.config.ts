import {
  APPROVAL_STATUS_DATA,
  EMPLOYEE_NAME_DATA,
  EMPLOYEE_STATUS_DATA,
} from '@shared/config/static-data.config';
import {
  IFormButtonConfig,
  ITableSearchFilterInputFieldsConfig,
  ITableSearchFilterFormConfig,
} from '@shared/models';
import {
  EButtonSeverity,
  EDateSelectionMode,
  EFieldType,
  ETableFilterMatchMode,
} from '@shared/types';

const SEARCH_FILTER_LEAVE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
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
    leaveDuration: {
      fieldType: EFieldType.Date,
      id: 'leaveDuration',
      fieldName: 'leaveDuration',
      label: 'Leave Duration',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
      },
      matchmode: ETableFilterMatchMode.BETWEEN,
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

const SEARCH_FILTER_LEAVE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
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

export const SEARCH_FILTER_LEAVE_FORM_CONFIG: ITableSearchFilterFormConfig = {
  fields: SEARCH_FILTER_LEAVE_FORM_FIELDS_CONFIG,
  buttons: SEARCH_FILTER_LEAVE_FORM_BUTTONS_CONFIG,
};
