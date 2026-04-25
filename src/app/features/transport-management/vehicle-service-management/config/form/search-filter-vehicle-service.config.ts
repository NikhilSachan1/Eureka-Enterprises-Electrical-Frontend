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
import { IVehicleServiceGetUIFormDto } from '../../types/vehicle-service.dto';

const SEARCH_FILTER_VEHICLE_SERVICE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IVehicleServiceGetUIFormDto & { globalSearch?: string }
> = {
  vehicleName: {
    fieldType: EDataType.SELECT,
    id: 'vehicleName',
    fieldName: 'vehicleName',
    label: 'Vehicle Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  serviceType: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'serviceType',
    fieldName: 'serviceType',
    label: 'Service Type',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.SERVICE_TYPE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  serviceDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    fieldName: 'serviceDate',
    label: 'Service start date – end date',
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    hint: 'Search by vehicle name, remarks, service center name',
  },
};

const SEARCH_FILTER_VEHICLE_SERVICE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_VEHICLE_SERVICE_FORM_CONFIG: ITableSearchFilterFormConfig<IVehicleServiceGetUIFormDto> =
  {
    fields: SEARCH_FILTER_VEHICLE_SERVICE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VEHICLE_SERVICE_FORM_BUTTONS_CONFIG,
  };
