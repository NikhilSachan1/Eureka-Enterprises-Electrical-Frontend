import { COMMON_FORM_ACTIONS } from '@shared/config';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import {
  EDataType,
  IFormButtonConfig,
  ITableSearchFilterFormConfig,
  ITableSearchFilterInputFieldsConfig,
} from '@shared/types';
import { ISalaryStructureGetFormDto } from '@features/payroll-management/types/payroll.dto';

const SEARCH_FILTER_SALARY_STRUCTURE_FORM_FIELDS_CONFIG: ITableSearchFilterInputFieldsConfig<ISalaryStructureGetFormDto> =
  {
    employeeName: {
      ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName,
      fieldType: EDataType.SELECT,
      selectConfig: {
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.employeeName.multiSelectConfig,
      },
    },
  };

const SEARCH_FILTER_SALARY_STRUCTURE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.FILTER,
  },
};

export const SEARCH_FILTER_SALARY_STRUCTURE_FORM_CONFIG: ITableSearchFilterFormConfig<ISalaryStructureGetFormDto> =
  {
    fields: SEARCH_FILTER_SALARY_STRUCTURE_FORM_FIELDS_CONFIG,
    buttons: SEARCH_FILTER_SALARY_STRUCTURE_FORM_BUTTONS_CONFIG,
  };
