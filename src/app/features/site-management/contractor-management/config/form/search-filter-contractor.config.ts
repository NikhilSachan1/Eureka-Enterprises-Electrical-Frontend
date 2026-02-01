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
import { IContractorGetFormDto } from '../../types/contractor.dto';

const SEARCH_FILTER_CONTRACTOR_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<
  IContractorGetFormDto & { globalSearch?: string }
> = {
  contractorState: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'contractorState',
    fieldName: 'contractorState',
    label: 'State',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.STATES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  contractorCity: {
    fieldType: EDataType.MULTI_SELECT,
    id: 'contractorCity',
    fieldName: 'contractorCity',
    label: 'City',
    multiSelectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.COMMON,
        dropdownName: CONFIGURATION_KEYS.COMMON.CITIES,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  contractorStatus: {
    fieldType: EDataType.SELECT,
    id: 'contractorStatus',
    fieldName: 'contractorStatus',
    label: 'Status',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.CONTRACTOR,
        dropdownName: CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_STATUS,
      },
    },
    matchmode: ETableFilterMatchMode.IN,
  },
  globalSearch: {
    ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
  },
};

const SEARCH_FILTER_CONTRACTOR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_CONTRACTOR_FORM_CONFIG: ITableSearchFilterFormConfig<IContractorGetFormDto> =
  {
    fields: SEARCH_FILTER_CONTRACTOR_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_CONTRACTOR_FORM_BUTTONS_CONFIG,
  };
