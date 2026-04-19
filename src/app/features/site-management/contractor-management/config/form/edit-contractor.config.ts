import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IContractorEditFormDto } from '../../types/contractor.dto';
import { ADD_CONTRACTOR_FORM_CONFIG } from './add-contractor.config';

const EDIT_CONTRACTOR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IContractorEditFormDto> =
  {
    ...ADD_CONTRACTOR_FORM_CONFIG.fields,
  };

const EDIT_CONTRACTOR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Contractor',
    tooltip: 'Update contractor',
  },
};

export const EDIT_CONTRACTOR_FORM_CONFIG: IFormConfig<IContractorEditFormDto> =
  {
    fields: EDIT_CONTRACTOR_FORM_FIELDS_CONFIG,
    buttons: EDIT_CONTRACTOR_FORM_BUTTONS_CONFIG,
  };
