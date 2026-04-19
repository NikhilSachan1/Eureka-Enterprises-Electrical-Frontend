import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ADD_PETRO_CARD_FORM_CONFIG } from './add-petro-card.config';
import { IPetroCardEditFormDto } from '../../types/petro-card.dto';

const EDIT_PETRO_CARD_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPetroCardEditFormDto> =
  {
    ...ADD_PETRO_CARD_FORM_CONFIG.fields,
  };

const EDIT_PETRO_CARD_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Petro Card',
    tooltip: 'Update petro card',
  },
};

export const EDIT_PETRO_CARD_FORM_CONFIG: IFormConfig<IPetroCardEditFormDto> = {
  fields: EDIT_PETRO_CARD_FORM_FIELDS_CONFIG,
  buttons: EDIT_PETRO_CARD_FORM_BUTTONS_CONFIG,
};
