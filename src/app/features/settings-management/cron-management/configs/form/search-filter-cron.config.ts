import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_CRON_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<{
  globalSearch?: string;
}> = {
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_CRON_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_CRON_FORM_CONFIG: ITableSearchFilterFormConfig = {
  fields: SEARCH_FILTER_CRON_FORM_FIELDS_CONFIG,
  buttons: SEARCH_FILTER_CRON_FORM_BUTTONS_CONFIG,
};
