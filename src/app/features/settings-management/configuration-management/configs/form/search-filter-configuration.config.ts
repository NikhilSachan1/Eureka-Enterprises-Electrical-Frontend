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
import { IConfigurationGetFormDto } from '../../types/configuration.dto';

const SEARCH_FILTER_CONFIGURATION_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IConfigurationGetFormDto & { globalSearch?: string }
> = {
  moduleName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'moduleName',
    fieldName: 'moduleName',
    label: 'Module Name',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_CONFIGURATION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_CONFIGURATION_FORM_CONFIG: ITableSearchFilterFormConfig<IConfigurationGetFormDto> =
  {
    fields: SEARCH_FILTER_CONFIGURATION_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_CONFIGURATION_FORM_BUTTONS_CONFIG,
  };
