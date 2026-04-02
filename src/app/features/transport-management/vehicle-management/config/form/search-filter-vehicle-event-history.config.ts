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
import { IVehicleEventHistoryGetFormDto } from '../../types/vehicle.dto';

const SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<IVehicleEventHistoryGetFormDto> =
  {
    vehicleEventTypes: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'vehicleEventTypes',
      fieldName: 'vehicleEventTypes',
      label: 'Event Types',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.EVENT_STATUS_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    vehicleFromEmployeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      fieldName: 'vehicleFromEmployeeName',
      fieldType: EDataType.SELECT,
      label: 'From User',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    vehicleToEmployeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      fieldName: 'vehicleToEmployeeName',
      label: 'To User',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    vehicleEventDate: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      fieldName: 'vehicleEventDate',
      label: 'Event Date',
      matchmode: ETableFilterMatchMode.BETWEEN,
    },
  };

const SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_BUTTONS_CONFIG: IFormButtonConfig =
  {
    reset: {
      ...COMMON_FORM_ACTIONS.RESET,
    },
    submit: {
      ...COMMON_FORM_ACTIONS.FILTER,
    },
  };

export const SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_CONFIG: ITableSearchFilterFormConfig<IVehicleEventHistoryGetFormDto> =
  {
    fields: SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_BUTTONS_CONFIG,
  };
