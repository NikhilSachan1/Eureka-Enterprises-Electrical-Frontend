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
import { IPaymentSheetGetFormDto } from '../../types/payment-sheet.dto';

const SEARCH_FILTER_PAYMENT_SHEET_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IPaymentSheetGetFormDto & { globalSearch?: string }
> = {
  paymentSheetStatus: {
    fieldType: EDataType.SELECT,
    id: 'paymentSheetStatus',
    fieldName: 'paymentSheetStatus',
    label: 'Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PAYMENTS,
        dropdownName: CONFIGURATION_KEYS.PAYMENTS.SHEET_STATUSES,
      },
      filterOptions: {
        exclude: ['CANCELLED'],
      },
    },
    matchmode: ETableFilterMatchMode.EQUALS,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by sheet number or title',
  },
};

const SEARCH_FILTER_PAYMENT_SHEET_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_PAYMENT_SHEET_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_PAYMENT_SHEET_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_PAYMENT_SHEET_FORM_BUTTONS_CONFIG,
  };
