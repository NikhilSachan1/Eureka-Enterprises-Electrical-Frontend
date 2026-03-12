import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IDsrEditUIFormDto } from '../../types/project.dto';
import { ADD_DSR_FORM_CONFIG } from './add-dsr.config';

const EDIT_DSR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDsrEditUIFormDto> = {
  ...ADD_DSR_FORM_CONFIG.fields,
  statusDate: {
    ...ADD_DSR_FORM_CONFIG.fields.statusDate,
    disabledInput: true,
  },
};

const EDIT_DSR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update DSR',
    tooltip: 'Edit DSR',
  },
};

export const EDIT_DSR_FORM_CONFIG: IFormConfig<IDsrEditUIFormDto> = {
  fields: EDIT_DSR_FORM_FIELDS_CONFIG,
  buttons: EDIT_DSR_FORM_BUTTONS_CONFIG,
};
