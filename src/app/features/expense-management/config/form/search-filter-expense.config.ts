import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  APPROVAL_STATUS_DATA,
  EXPENSE_CATEGORY_DATA,
} from '@shared/config/static-data.config';
import {
  EApprovalStatus,
  EFieldType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { filterOptionsByIncludeExclude } from '@shared/utility';

const SEARCH_FILTER_EXPENSE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    employeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    },
    expenseDate: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      label: 'Expense Date',
      fieldName: 'expenseDate',
    },
    expenseType: {
      fieldType: EFieldType.MultiSelect,
      id: 'expenseType',
      fieldName: 'expenseType',
      label: 'Expense Type',
      multiSelectConfig: {
        optionsDropdown: EXPENSE_CATEGORY_DATA,
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    approvalStatus: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
      multiSelectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
        optionsDropdown: filterOptionsByIncludeExclude(
          APPROVAL_STATUS_DATA,
          [],
          [EApprovalStatus.CANCELLED]
        ),
      },
    },
    globalSearch: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
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
