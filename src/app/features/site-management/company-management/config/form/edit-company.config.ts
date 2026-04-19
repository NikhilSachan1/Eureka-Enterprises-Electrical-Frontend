import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ICompanyEditFormDto } from '../../types/company.dto';
import { ADD_COMPANY_FORM_CONFIG } from './add-company.config';

const EDIT_COMPANY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ICompanyEditFormDto> =
  {
    ...ADD_COMPANY_FORM_CONFIG.fields,
  };

const EDIT_COMPANY_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Company',
    tooltip: 'Update company',
  },
};

export const EDIT_COMPANY_FORM_CONFIG: IFormConfig<ICompanyEditFormDto> = {
  fields: EDIT_COMPANY_FORM_FIELDS_CONFIG,
  buttons: EDIT_COMPANY_FORM_BUTTONS_CONFIG,
};
