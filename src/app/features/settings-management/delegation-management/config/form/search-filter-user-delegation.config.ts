import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_USER_DELEGATION_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    module: {
      fieldType: EDataType.SELECT,
      id: 'module',
      fieldName: 'module',
      label: 'Module',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PERMISSION,
          dropdownName: CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
        },
        showClearButton: true,
      },
      matchmode: ETableFilterMatchMode.EQUALS,
    },
    managerName: {
      fieldType: EDataType.SELECT,
      id: 'managerName',
      fieldName: 'managerName',
      label: 'Manager',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          archivedHandling: 'enabled',
        },
        showClearButton: true,
      },
      matchmode: ETableFilterMatchMode.EQUALS,
    },
    memberName: {
      fieldType: EDataType.SELECT,
      id: 'memberName',
      fieldName: 'memberName',
      label: 'Member',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          archivedHandling: 'enabled',
        },
        showClearButton: true,
      },
      matchmode: ETableFilterMatchMode.EQUALS,
    },
  };

const SEARCH_FILTER_USER_DELEGATION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_USER_DELEGATION_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_USER_DELEGATION_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_USER_DELEGATION_FORM_BUTTONS_CONFIG,
  };
