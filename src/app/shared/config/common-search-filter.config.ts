import {
  EDataType,
  ETableFilterMatchMode,
  EDateSelectionMode,
} from '@shared/types';
import { EMPLOYEE_NAME_DATA, APPROVAL_STATUS_DATA } from './static-data.config';

export const COMMON_SEARCH_FILTER_FIELDS_CONFIG = {
  employeeName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    multiSelectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  dateRange: {
    fieldType: EDataType.DATE,
    id: 'dateRange',
    fieldName: 'dateRange',
    label: 'Date Range',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
    },
    matchmode: ETableFilterMatchMode.BETWEEN,
  },
  approvalStatus: {
    fieldType: EDataType.MULTI_SELECT,
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
    fieldType: EDataType.TEXT,
    id: 'globalSearch',
    fieldName: 'globalSearch',
    label: 'Search',
    matchmode: ETableFilterMatchMode.CONTAINS,
  },
};
