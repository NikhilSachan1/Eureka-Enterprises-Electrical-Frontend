import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ADD_PETRO_CARD_FORM_CONFIG } from './add-petro-card.config';

const EDIT_PETRO_CARD_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  ...ADD_PETRO_CARD_FORM_CONFIG.fields,
};

const EDIT_PETRO_CARD_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Petro Card',
    tooltip: 'Edit petro card',
  },
};

export const EDIT_PETRO_CARD_FORM_CONFIG: IFormConfig = {
  fields: EDIT_PETRO_CARD_FORM_FIELDS_CONFIG,
  buttons: EDIT_PETRO_CARD_FORM_BUTTONS_CONFIG,
};
