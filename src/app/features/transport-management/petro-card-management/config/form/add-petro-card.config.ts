import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { REGEX } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ADD_PETRO_CARD_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  cardNumber: {
    id: 'cardNumber',
    fieldName: 'cardNumber',
    label: 'Card Number',
    fieldType: EDataType.TEXT,
    validators: [
      Validators.required,
      Validators.minLength(16),
      Validators.maxLength(16),
      Validators.pattern(REGEX.NUMBER_ONLY),
    ],
    applyPatternFilter: true,
  },
};

const ADD_PETRO_CARD_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Petro Card',
    tooltip: 'Add a new petro card',
  },
};

export const ADD_PETRO_CARD_FORM_CONFIG: IFormConfig = {
  fields: ADD_PETRO_CARD_FORM_FIELDS_CONFIG,
  buttons: ADD_PETRO_CARD_FORM_BUTTONS_CONFIG,
};
