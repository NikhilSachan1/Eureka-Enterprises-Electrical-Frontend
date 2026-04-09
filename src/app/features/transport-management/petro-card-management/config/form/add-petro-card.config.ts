import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IPetroCardAddFormDto } from '../../types/petro-card.dto';

const ADD_PETRO_CARD_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPetroCardAddFormDto> =
  {
    petroCardName: {
      id: 'petroCardName',
      fieldName: 'petroCardName',
      label: 'Petro Card Name',
      fieldType: EDataType.TEXT,
      textConfig: {
        textCase: ETextCase.TITLECASE,
      },
      validators: [Validators.required],
    },
    petroCardNumber: {
      id: 'petroCardNumber',
      fieldName: 'petroCardNumber',
      label: 'Petro Card Number',
      fieldType: EDataType.TEXT,
      validators: [
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
      ],
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

export const ADD_PETRO_CARD_FORM_CONFIG: IFormConfig<IPetroCardAddFormDto> = {
  fields: ADD_PETRO_CARD_FORM_FIELDS_CONFIG,
  buttons: ADD_PETRO_CARD_FORM_BUTTONS_CONFIG,
};
