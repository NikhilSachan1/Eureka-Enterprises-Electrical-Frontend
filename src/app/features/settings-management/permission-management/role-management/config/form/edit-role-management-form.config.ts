import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity } from '@shared/types';
import { ADD_ROLE_FORM_CONFIG } from '@features/settings-management/permission-management/role-management/config/form/add-role-management-form.config';

const EDIT_ROLE_FIELDS_CONFIG: IFormInputFieldsConfig = {
  roleName: ADD_ROLE_FORM_CONFIG.fields['roleName'],
  comment: ADD_ROLE_FORM_CONFIG.fields['comment'],
};

const EDIT_ROLE_BUTTONS_CONFIG: IFormButtonConfig = {
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

export const EDIT_ROLE_FORM_CONFIG: IFormConfig = {
  fields: EDIT_ROLE_FIELDS_CONFIG,
  buttons: EDIT_ROLE_BUTTONS_CONFIG,
};
