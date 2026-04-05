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
import { IProjectGetFormDto } from '../../types/project.dto';
import { APP_PERMISSION } from '@core/constants';

const SEARCH_FILTER_PROJECT_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IProjectGetFormDto & { globalSearch?: string }
> = {
  companyNames: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'companyNames',
    fieldName: 'companyNames',
    label: 'Company',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMPANY,
        dropdownName: CONFIGURATION_KEYS.COMPANY.COMPANY_LIST,
      },
    },
    permission: [APP_PERMISSION.UI.PROJECT.SEARCH_FILTER_COMPANY_NAME],
    matchmode: ETableFilterMatchMode.IN,
  },
  contractorNames: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'contractorNames',
    fieldName: 'contractorNames',
    label: 'Contractor',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.CONTRACTOR,
        dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST,
      },
    },
    permission: [APP_PERMISSION.UI.PROJECT.SEARCH_FILTER_CONTRACTOR_NAME],
    matchmode: ETableFilterMatchMode.IN,
  },
  projectCity: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'projectCity',
    fieldName: 'projectCity',
    label: 'City',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.CITIES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  projectState: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'projectState',
    fieldName: 'projectState',
    label: 'State',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.STATES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  projectStatus: {
    fieldType: EDataType.SELECT,
    id: 'projectStatus',
    fieldName: 'projectStatus',
    label: 'Project Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.PROJECT,
        dropdownName: CONFIGURATION_KEYS.PROJECT.PROJECT_STATUS,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_PROJECT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_PROJECT_FORM_CONFIG: ITableSearchFilterFormConfig<IProjectGetFormDto> =
  {
    fields: SEARCH_FILTER_PROJECT_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_PROJECT_FORM_BUTTONS_CONFIG,
  };
