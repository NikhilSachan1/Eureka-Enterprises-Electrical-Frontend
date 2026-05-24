import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { ISystemPermissionGetFormDto } from '../../types/system-permission.dto';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { SYSTEM_PERMISSION_PLATFORM_OPTIONS } from '../system-permission.constants';

const SEARCH_FILTER_SYSTEM_PERMISSION_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  ISystemPermissionGetFormDto & { globalSearch?: string }
> = {
  moduleName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'moduleName',
    fieldName: 'moduleName',
    label: 'Module Name',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PERMISSION,
        dropdownName: CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  platform: {
    fieldType: EDataType.SELECT,
    id: 'platform',
    fieldName: 'platform',
    label: 'Platform',
    selectConfig: {
      optionsDropdown: SYSTEM_PERMISSION_PLATFORM_OPTIONS,
    },
    matchmode: ETableFilterMatchMode.EQUALS,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_SYSTEM_PERMISSION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_SYSTEM_PERMISSION_FORM_CONFIG: ITableSearchFilterFormConfig<ISystemPermissionGetFormDto> =
  {
    fields: SEARCH_FILTER_SYSTEM_PERMISSION_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_SYSTEM_PERMISSION_FORM_BUTTONS_CONFIG,
  };
