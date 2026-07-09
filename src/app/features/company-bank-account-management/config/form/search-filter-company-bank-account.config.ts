import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { ICompanyBankAccountGetFormDto } from '../../types/company-bank-account.dto';

const SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  ICompanyBankAccountGetFormDto & { globalSearch?: string }
> = {
  bankStatus: {
    fieldType: EDataType.SELECT,
    id: 'bankStatus',
    fieldName: 'bankStatus',
    label: 'Bank Status',
    selectConfig: {
      optionsDropdown: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
      showClearButton: true,
    },
    matchmode: ETableFilterMatchMode.EQUALS,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by account number, bank name',
  },
};

const SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_BUTTONS_CONFIG: IFormButtonConfig =
  {
    reset: {
      ...COMMON_FORM_ACTIONS.RESET,
    },
    submit: {
      ...COMMON_FORM_ACTIONS.FILTER,
    },
  };

export const SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_CONFIG: ITableSearchFilterFormConfig<ICompanyBankAccountGetFormDto> =
  {
    fields: SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_COMPANY_BANK_ACCOUNT_FORM_BUTTONS_CONFIG,
  };
