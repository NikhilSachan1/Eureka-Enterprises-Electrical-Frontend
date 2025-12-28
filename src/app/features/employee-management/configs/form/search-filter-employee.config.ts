import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_EMPLOYEE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    employeeRole: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'employeeRole',
      fieldName: 'employeeRole',
      label: 'Employee Role',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMMON,
          dropdownName: CONFIGURATION_KEYS.COMMON.ROLE_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    globalSearch: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    },
  };

const SEARCH_FILTER_EMPLOYEE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_EMPLOYEE_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_EMPLOYEE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_EMPLOYEE_FORM_BUTTONS_CONFIG,
  };
