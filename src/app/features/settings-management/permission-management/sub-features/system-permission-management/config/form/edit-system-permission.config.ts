import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { SYSTEM_PERMISSION_FORM_ADD_CONFIG } from './add-system-permission.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const SYSTEM_PERMISSION_FORM_EDIT_FIELDS_CONFIG: IFormInputFieldsConfig = {
  comment: SYSTEM_PERMISSION_FORM_ADD_CONFIG.fields['comment'],
};

const SYSTEM_PERMISSION_FORM_EDIT_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Permission',
    tooltip: 'Update the permission in the system',
  },
};

export const SYSTEM_PERMISSION_FORM_EDIT_CONFIG: IFormConfig = {
  fields: SYSTEM_PERMISSION_FORM_EDIT_FIELDS_CONFIG,
  buttons: SYSTEM_PERMISSION_FORM_EDIT_BUTTONS_CONFIG,
};
