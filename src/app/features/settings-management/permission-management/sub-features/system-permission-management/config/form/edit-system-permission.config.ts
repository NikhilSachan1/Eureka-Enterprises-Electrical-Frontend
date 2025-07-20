import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity } from '@shared/types';
import { SYSTEM_PERMISSION_FORM_ADD_CONFIG } from './add-system-permission.config';

const SYSTEM_PERMISSION_FORM_EDIT_FIELDS_CONFIG: IFormInputFieldsConfig = {
  comment: SYSTEM_PERMISSION_FORM_ADD_CONFIG.fields['comment'],
};

const SYSTEM_PERMISSION_FORM_EDIT_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  submit: {
    label: 'Update Permission',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Update the permission in the system',
  },
};

export const SYSTEM_PERMISSION_FORM_EDIT_CONFIG: IFormConfig = {
  fields: SYSTEM_PERMISSION_FORM_EDIT_FIELDS_CONFIG,
  buttons: SYSTEM_PERMISSION_FORM_EDIT_BUTTONS_CONFIG,
};
