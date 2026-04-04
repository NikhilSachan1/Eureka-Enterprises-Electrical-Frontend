import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IDocEditUIFormDto } from '../../types/doc.dto';
import { ADD_DOC_FORM_CONFIG } from './add-doc.config';

const EDIT_DOC_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDocEditUIFormDto> = {
  ...ADD_DOC_FORM_CONFIG.fields,
};

const EDIT_DOC_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Doc',
    tooltip: 'Edit Doc',
  },
};

export const EDIT_DOC_FORM_CONFIG: IFormConfig<IDocEditUIFormDto> = {
  fields: EDIT_DOC_FORM_FIELDS_CONFIG,
  buttons: EDIT_DOC_FORM_BUTTONS_CONFIG,
};
