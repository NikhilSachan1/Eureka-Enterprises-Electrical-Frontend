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
import { ICompanyGetFormDto } from '../../types/company.dto';

const SEARCH_FILTER_COMPANY_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  ICompanyGetFormDto & { globalSearch?: string }
> = {
  parentCompanyName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'parentCompanyName',
    fieldName: 'parentCompanyName',
    label: 'Parent Company',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMPANY,
        dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  companyState: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'companyState',
    fieldName: 'companyState',
    label: 'State',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.STATES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  companyCity: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'companyCity',
    fieldName: 'companyCity',
    label: 'City',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.CITIES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  companyStatus: {
    fieldType: EDataType.SELECT,
    id: 'companyStatus',
    fieldName: 'companyStatus',
    label: 'Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMPANY,
        dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_STATUS,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_COMPANY_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_COMPANY_FORM_CONFIG: ITableSearchFilterFormConfig<ICompanyGetFormDto> =
  {
    fields: SEARCH_FILTER_COMPANY_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_COMPANY_FORM_BUTTONS_CONFIG,
  };
