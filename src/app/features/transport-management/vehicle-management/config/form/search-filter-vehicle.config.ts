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
import { IvehicleGetFormDto } from '../../types/vehicle.dto';

const SEARCH_FILTER_VEHICLE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IvehicleGetFormDto & { globalSearch?: string }
> = {
  vehicleFuelType: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vehicleFuelType',
    fieldName: 'vehicleFuelType',
    label: 'Fuel Type',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.FUEL_TYPE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vehicleStatus: {
    fieldType: EDataType.SELECT,
    id: 'vehicleStatus',
    fieldName: 'vehicleStatus',
    label: 'Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.STATUS_LIST,
      },
      filterOptions: {
        include: ['ASSIGNED', 'AVAILABLE'],
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vehiclePUCStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vehiclePUCStatus',
    fieldName: 'vehiclePUCStatus',
    label: 'PUC Status',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vehicleInsuranceStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vehicleInsuranceStatus',
    fieldName: 'vehicleInsuranceStatus',
    label: 'Insurance Status',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vehicleServiceDueStatus: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'vehicleServiceDueStatus',
    fieldName: 'vehicleServiceDueStatus',
    label: 'Service Status',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.SERVICE_ALERT_STATUS_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  vehicleAssignee: {
    fieldType: EDataType.SELECT,
    id: 'vehicleAssignee',
    fieldName: 'vehicleAssignee',
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
    hint: 'Search by vehicle registration number, brand, model',
  },
};

const SEARCH_FILTER_VEHICLE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_VEHICLE_FORM_CONFIG: ITableSearchFilterFormConfig<IvehicleGetFormDto> =
  {
    fields: SEARCH_FILTER_VEHICLE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VEHICLE_FORM_BUTTONS_CONFIG,
  };
