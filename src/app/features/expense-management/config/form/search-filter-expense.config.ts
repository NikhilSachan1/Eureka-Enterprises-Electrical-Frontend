import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EApprovalStatus,
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_EXPENSE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    employeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      permission: [APP_PERMISSION.UI.EXPENSE.SEARCH_FILTER_EMPLOYEE_NAME],
      multiSelectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig,
        dynamicDropdown: {
          ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig
            .dynamicDropdown,
          archivedHandling: 'enabled',
        },
      },
    },
    expenseDate: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      label: 'Expense Date',
      fieldName: 'expenseDate',
    },
    expenseType: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'expenseType',
      fieldName: 'expenseType',
      label: 'Expense Type',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EXPENSE,
          dropdownName: CONFIGURATION_KEYS.EXPENSE.CATEGORIES,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    approvalStatus: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
      multiSelectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
        filterOptions: {
          exclude: [
            ...(COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus
              .multiSelectConfig.filterOptions?.exclude ?? []),
            EApprovalStatus.CANCELLED,
          ],
        },
      },
    },
    globalSearch: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
      hint: 'Search by employee name, note, amount, transaction id',
    },
  };

const SEARCH_FILTER_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_EXPENSE_FORM_CONFIG: ITableSearchFilterFormConfig = {
  fields: SEARCH_FILTER_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: SEARCH_FILTER_EXPENSE_FORM_BUTTONS_CONFIG,
};
