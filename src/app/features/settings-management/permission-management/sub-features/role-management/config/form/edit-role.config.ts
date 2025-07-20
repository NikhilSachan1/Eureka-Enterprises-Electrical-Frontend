import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity } from '@shared/types';
import { ROLE_FORM_ADD_CONFIG } from './add-role.config';

const ROLE_FORM_EDIT_FIELDS_CONFIG: IFormInputFieldsConfig = {
  roleName: ROLE_FORM_ADD_CONFIG.fields['roleName'],
  comment: ROLE_FORM_ADD_CONFIG.fields['comment'],
};

const ROLE_FORM_EDIT_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  submit: {
    label: 'Update Role',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Update the role in the system',
  },
};

export const ROLE_FORM_EDIT_CONFIG: IFormConfig = {
  fields: ROLE_FORM_EDIT_FIELDS_CONFIG,
  buttons: ROLE_FORM_EDIT_BUTTONS_CONFIG,
};
