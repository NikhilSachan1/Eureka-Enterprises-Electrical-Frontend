import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { ROLE_FORM_ADD_CONFIG } from './add-role.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const ROLE_FORM_EDIT_FIELDS_CONFIG: IFormInputFieldsConfig = {
  roleName: ROLE_FORM_ADD_CONFIG.fields['roleName'],
  comment: ROLE_FORM_ADD_CONFIG.fields['comment'],
};

const ROLE_FORM_EDIT_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Role',
    tooltip: 'Update the role in the system',
  },
};

export const ROLE_FORM_EDIT_CONFIG: IFormConfig = {
  fields: ROLE_FORM_EDIT_FIELDS_CONFIG,
  buttons: ROLE_FORM_EDIT_BUTTONS_CONFIG,
};
