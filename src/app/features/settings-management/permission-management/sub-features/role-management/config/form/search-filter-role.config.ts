import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { IRoleGetFormDto } from '../../types/role.dto';

const SEARCH_FILTER_ROLE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IRoleGetFormDto & { globalSearch?: string }
> = {
  roleName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'roleName',
    fieldName: 'roleName',
    label: 'Role Name',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.ROLE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_ROLE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_ROLE_FORM_CONFIG: ITableSearchFilterFormConfig<IRoleGetFormDto> =
  {
    fields: SEARCH_FILTER_ROLE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_ROLE_FORM_BUTTONS_CONFIG,
  };
