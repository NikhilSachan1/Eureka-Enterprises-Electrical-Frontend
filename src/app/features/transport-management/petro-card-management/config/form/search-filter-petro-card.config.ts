import {
  COMMON_FORM_ACTIONS,
  DEFAULT_SELECT_INPUT_FIELD_CONFIG,
} from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  ETableFilterMatchMode,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';

const SEARCH_FILTER_PETRO_CARD_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig =
  {
    cardStatus: {
      fieldType: EDataType.SELECT,
      id: 'cardStatus',
      fieldName: 'cardStatus',
      label: 'Status',
      selectConfig: {
        ...DEFAULT_SELECT_INPUT_FIELD_CONFIG.selectConfig,
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PETRO_CARD,
          dropdownName: CONFIGURATION_KEYS.PETRO_CARD.STATUS,
        },
      },
      matchmode: ETableFilterMatchMode.IN,
    },
    globalSearch: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
    },
  };

const SEARCH_FILTER_PETRO_CARD_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_PETRO_CARD_FORM_CONFIG: ITableSearchFilterFormConfig =
  {
    fields: SEARCH_FILTER_PETRO_CARD_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_PETRO_CARD_FORM_BUTTONS_CONFIG,
  };
