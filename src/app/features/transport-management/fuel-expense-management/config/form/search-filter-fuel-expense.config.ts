import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  EApprovalStatus,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IFuelExpenseGetFormDto } from '../../types/fuel-expense.dto';

const SEARCH_FILTER_FUEL_EXPENSE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IFuelExpenseGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
  },
  fuelExpenseDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Fuel Expense Date',
    fieldName: 'fuelExpenseDate',
  },
  approvalStatus: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus,
    multiSelectConfig: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.approvalStatus.multiSelectConfig,
      filterOptions: {
        exclude: [EApprovalStatus.CANCELLED],
      },
    },
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_FUEL_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_FUEL_EXPENSE_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_FUEL_EXPENSE_FORM_BUTTONS_CONFIG,
  };
