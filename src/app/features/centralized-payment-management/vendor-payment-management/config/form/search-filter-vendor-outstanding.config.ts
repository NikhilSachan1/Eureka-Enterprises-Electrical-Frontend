import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IVendorOutstandingGetFormDto } from '../../types/vendor-outstanding.dto';

const SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IVendorOutstandingGetFormDto & { globalSearch?: string }
> = {
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by vendor name or GST number',
  },
};

const SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_BUTTONS_CONFIG: IFormButtonConfig =
  {
    reset: {
      ...COMMON_FORM_ACTIONS.RESET,
    },
    submit: {
      ...COMMON_FORM_ACTIONS.FILTER,
    },
  };

export const SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_BUTTONS_CONFIG,
  };
