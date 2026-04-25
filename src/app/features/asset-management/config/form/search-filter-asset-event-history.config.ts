import { IAssetEventHistoryGetFormDto } from '@features/asset-management/types/asset.dto';
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

const SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IAssetEventHistoryGetFormDto & { assetName?: string; globalSearch?: string }
> = {
  assetName: {
    fieldType: EDataType.SELECT,
    id: 'assetName',
    fieldName: 'assetName',
    label: 'Asset Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.ASSET_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetEventTypes: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'assetEventTypes',
    fieldName: 'assetEventTypes',
    label: 'Event Types',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.ASSET,
        dropdownName: CONFIGURATION_KEYS.ASSET.EVENT_STATUS_LIST,
      },
      filterOptions: {
        include: [
          'ASSET_ADDED',
          'AVAILABLE',
          'HANDOVER_INITIATED',
          'HANDOVER_ACCEPTED',
          'HANDOVER_REJECTED',
          'HANDOVER_CANCELLED',
        ],
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetFromEmployeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    fieldName: 'assetFromEmployeeName',
    fieldType: EDataType.SELECT,
    label: 'From User',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        archivedHandling: 'enabled',
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetToEmployeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
    fieldName: 'assetToEmployeeName',
    label: 'To User',
    fieldType: EDataType.SELECT,
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        archivedHandling: 'enabled',
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  assetEventDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    fieldName: 'assetEventDate',
    label: 'Asset event start date – end date',
  },
};

const SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_BUTTONS_CONFIG: IFormButtonConfig =
  {
    reset: {
      ...COMMON_FORM_ACTIONS.RESET,
    },
    submit: {
      ...COMMON_FORM_ACTIONS.FILTER,
    },
  };

export const SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_CONFIG: ITableSearchFilterFormConfig<IAssetEventHistoryGetFormDto> =
  {
    fields: SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_ASSET_EVENT_HISTORY_FORM_BUTTONS_CONFIG,
  };
