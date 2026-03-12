import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IDsrGetFormDto } from '../../types/project.dto';

const SEARCH_FILTER_DSR_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<IDsrGetFormDto> =
  {
    employeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    },
    statusDate: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      id: 'statusDate',
      fieldName: 'statusDate',
      label: 'Status Date',
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
