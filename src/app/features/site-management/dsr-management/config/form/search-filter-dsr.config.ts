import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IDsrGetFormDto } from '@features/site-management/dsr-management/types/dsr.dto';
import { APP_PERMISSION } from '@core/constants';

const SEARCH_FILTER_DSR_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IDsrGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    permission: [APP_PERMISSION.UI.DSR.SEARCH_FILTER_EMPLOYEE_NAME],
  },
  statusDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Status Date',
    fieldName: 'statusDate',
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_DSR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_DSR_FORM_CONFIG: ITableSearchFilterFormConfig<IDsrGetFormDto> =
  {
    fields: SEARCH_FILTER_DSR_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_DSR_FORM_BUTTONS_CONFIG,
  };
