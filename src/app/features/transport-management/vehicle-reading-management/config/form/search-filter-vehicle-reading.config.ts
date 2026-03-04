import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IvehicleReadingGetFormDto } from '../../types/vehicle-reading.dto';

const SEARCH_FILTER_VEHICLE_READING_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IvehicleReadingGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
  },
  vehicleName: {
    fieldType: EDataType.SELECT,
    id: 'vehicleName',
    fieldName: 'vehicleName',
    label: 'Select Vehicle',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.VEHICLE,
        dropdownName: CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST,
      },
    },
  },
  readingDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Reading Date',
    fieldName: 'readingDate',
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_VEHICLE_READING_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_VEHICLE_READING_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_VEHICLE_READING_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_VEHICLE_READING_FORM_BUTTONS_CONFIG,
  };
