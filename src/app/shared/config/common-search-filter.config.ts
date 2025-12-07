import {
  EFieldType,
  ETableFilterMatchMode,
  EDateSelectionMode,
} from '@shared/types';
import { EMPLOYEE_NAME_DATA, APPROVAL_STATUS_DATA } from './static-data.config';

export const COMMON_SEARCH_FILTER_FIELDS_CONFIG = {
  employeeName: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    multiSelectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  dateRange: {
    fieldType: EFieldType.Date,
    id: 'dateRange',
    fieldName: 'dateRange',
    label: 'Date Range',
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
