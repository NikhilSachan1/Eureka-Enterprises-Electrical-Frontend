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
import { IVendorGetFormDto } from '../../types/vendor.dto';

const SEARCH_FILTER_VENDOR_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IVendorGetFormDto & { globalSearch?: string }
> = {
  vendorType: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vendorType',
    fieldName: 'vendorType',
    label: 'Vendor Type',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VENDOR,
        dropdownName: CONFIGURATION_KEYS.VENDOR.VENDOR_TYPES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vendorState: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vendorState',
    fieldName: 'vendorState',
    label: 'State',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.STATES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vendorCity: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vendorCity',
    fieldName: 'vendorCity',
    label: 'City',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.CITIES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vendorStatus: {
    fieldType: EDataType.SELECT,
    id: 'vendorStatus',
    fieldName: 'vendorStatus',
    label: 'Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.CONTRACTOR,
        dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_VENDOR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_VENDOR_FORM_CONFIG: ITableSearchFilterFormConfig<IVendorGetFormDto> =
  {
    fields: SEARCH_FILTER_VENDOR_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VENDOR_FORM_BUTTONS_CONFIG,
  };
