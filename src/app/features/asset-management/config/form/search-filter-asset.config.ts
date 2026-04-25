import { IAssetGetFormDto } from '@features/asset-management/types/asset.dto';
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

const SEARCH_FILTER_ASSET_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IAssetGetFormDto & { globalSearch?: string }
> = {
  assetCategory: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'assetCategory',
    fieldName: 'assetCategory',
    label: 'Category',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.CATEGORY_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetType: {
    fieldType: EDataType.SELECT,
    id: 'assetType',
    fieldName: 'assetType',
    label: 'Type',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.TYPE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetStatus: {
    fieldType: EDataType.SELECT,
    id: 'assetStatus',
    fieldName: 'assetStatus',
    label: 'Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.STATUS_LIST,
      },
      filterOptions: {
        include: ['ASSIGNED', 'AVAILABLE'],
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetCalibrationStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'assetCalibrationStatus',
    fieldName: 'assetCalibrationStatus',
    label: 'Calibration Status',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.CALIBRATION_STATUS_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetWarrantyStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'assetWarrantyStatus',
    fieldName: 'assetWarrantyStatus',
    label: 'Warranty Status',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.WARRANTY_STATUS_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetAssignee: {
    fieldType: EDataType.SELECT,
    id: 'assetAssignee',
    fieldName: 'assetAssignee',
    label: 'Assignee',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        archivedHandling: 'enabled',
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by asset name, serial number, asset id',
  },
};

const SEARCH_FILTER_ASSET_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_ASSET_FORM_CONFIG: ITableSearchFilterFormConfig<IAssetGetFormDto> =
  {
    fields: SEARCH_FILTER_ASSET_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_ASSET_FORM_BUTTONS_CONFIG,
  };
