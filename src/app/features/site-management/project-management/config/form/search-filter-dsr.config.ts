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
import { IDsrGetFormDto } from '../../types/project.dto';

const SEARCH_FILTER_DSR_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IDsrGetFormDto & { globalSearch?: string }
> = {
  employeeName: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  statusDate: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.dateRange,
    label: 'Status Date',
    fieldName: 'statusDate',
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_DSR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_DSR_FORM_CONFIG: ITableSearchFilterFormConfig<IDsrGetFormDto> =
  {
    fields: SEARCH_FILTER_DSR_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_DSR_FORM_BUTTONS_CONFIG,
  };
