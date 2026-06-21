import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IFuelExpenseOutstandingGetFormDto } from '../../types/fuel-expense-outstanding.dto';

const SEARCH_FILTER_FUEL_EXPENSE_OUTSTANDING_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IFuelExpenseOutstandingGetFormDto & { globalSearch?: string }
> = {
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by employee name or code',
  },
};

const SEARCH_FILTER_FUEL_EXPENSE_OUTSTANDING_FORM_BUTTONS_CONFIG: IFormButtonConfig =
  {
    reset: {
      ...COMMON_FORM_ACTIONS.RESET,
    },
    submit: {
      ...COMMON_FORM_ACTIONS.FILTER,
    },
  };

export const SEARCH_FILTER_FUEL_EXPENSE_OUTSTANDING_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_FUEL_EXPENSE_OUTSTANDING_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_FUEL_EXPENSE_OUTSTANDING_FORM_BUTTONS_CONFIG,
  };
