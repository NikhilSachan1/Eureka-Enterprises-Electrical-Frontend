import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, EUserRole, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_VEHICLE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    fuelType: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'fuelType',
      fieldName: 'fuelType',
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
      fieldType: EDataType.MULTI_SELECT,
      id: 'vehicleStatus',
      fieldName: 'vehicleStatus',
      label: 'Status',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.STATUS_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    pucStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'pucStatus',
      fieldName: 'pucStatus',
      label: 'PUC Status',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    fitnessStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'fitnessStatus',
      fieldName: 'fitnessStatus',
      label: 'Fitness Status',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    insuranceStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'insuranceStatus',
      fieldName: 'insuranceStatus',
      label: 'Insurance Status',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.DOCUMENT_STATUS_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    serviceDueStatus: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'serviceDueStatus',
      fieldName: 'serviceDueStatus',
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
          filterByRole: [EUserRole.EMPLOYEE],
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    globalSearch: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
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

export const SEARCH_FILTER_VEHICLE_FORM_CONFIG: ITableSearchFilterFormConfig = {
  fields: SEARCH_FILTER_VEHICLE_FORM_FIELDS_CONFIG,
  buttons: SEARCH_FILTER_VEHICLE_FORM_BUTTONS_CONFIG,
};
