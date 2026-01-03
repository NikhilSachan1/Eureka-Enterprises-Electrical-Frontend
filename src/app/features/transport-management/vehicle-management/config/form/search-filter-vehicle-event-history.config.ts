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

const SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    eventTypes: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'eventTypes',
      fieldName: 'eventTypes',
      label: 'Event Types',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.VEHICLE,
          dropdownName: CONFIGURATION_KEYS.VEHICLE.EVENT_STATUS_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    fromUser: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      fieldName: 'fromUser',
      fieldType: EDataType.SELECT,
      label: 'From User',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          filterByRole: [EUserRole.EMPLOYEE],
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    toUser: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      fieldName: 'toUser',
      label: 'To User',
      fieldType: EDataType.SELECT,
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          filterByRole: [EUserRole.EMPLOYEE],
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    eventDate: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
      fieldName: 'eventDate',
      label: 'Event Date',
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

export const SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VEHICLE_EVENT_HISTORY_FORM_BUTTONS_CONFIG,
  };
