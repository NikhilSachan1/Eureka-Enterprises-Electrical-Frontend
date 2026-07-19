import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { IWorkforceAllocationGetFormDto } from '../../types/project.dto';

const SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<IWorkforceAllocationGetFormDto> =
  {
    projectName: {
      fieldType: EDataType.SELECT,
      id: 'projectName',
      fieldName: 'projectName',
      label: 'Project',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_LIST,
        },
      },
      matchmode: ETableFilterMatchMode.EQUALS,
    },
    allocatedStatus: {
      fieldType: EDataType.SELECT,
      id: 'allocatedStatus',
      fieldName: 'allocatedStatus',
      label: 'Allocation Status',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PROJECT,
          dropdownName: CONFIGURATION_KEYS.PROJECT.ALLOCATION_STATUS,
        },
      },
      matchmode: ETableFilterMatchMode.EQUALS,
    },
    search: {
      fieldType: EDataType.TEXT,
      id: 'search',
      fieldName: 'search',
      label: 'Search Employee',
    },
  };

const SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_BUTTONS_CONFIG: IFormButtonConfig =
  {
    reset: {
      ...COMMON_FORM_ACTIONS.RESET,
    },
    submit: {
      ...COMMON_FORM_ACTIONS.FILTER,
    },
  };

export const SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_CONFIG: ITableSearchFilterFormConfig<IWorkforceAllocationGetFormDto> =
  {
    fields: SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_WORKFORCE_ALLOCATION_FORM_BUTTONS_CONFIG,
  };
