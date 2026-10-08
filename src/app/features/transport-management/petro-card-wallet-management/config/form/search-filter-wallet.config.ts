import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { ICONS } from '@shared/constants';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';

const SEARCH_FILTER_WALLET_RECHARGE_FORM_FIELDS_CONFIG = {
  dateRange: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    id: 'walletRechargeDateRange',
  },
};

const SEARCH_FILTER_WALLET_RECHARGE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_WALLET_RECHARGES_FORM_CONFIG: ITableSearchFilterFormConfig =
{
  fields: SEARCH_FILTER_WALLET_RECHARGE_FORM_FIELDS_CONFIG,
  buttons: SEARCH_FILTER_WALLET_RECHARGE_FORM_BUTTONS_CONFIG,
};
