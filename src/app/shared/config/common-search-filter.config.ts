import {
  EDataType,
  ETableFilterMatchMode,
  EDateSelectionMode,
} from '@shared/types';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';

export const COMMON_SEARCH_FILTER_FIELDS_CONFIG = {
  employeeName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
      },
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
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.APPROVAL_STATUS,
      },
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
