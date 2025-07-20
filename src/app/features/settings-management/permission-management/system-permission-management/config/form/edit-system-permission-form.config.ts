import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity } from '@shared/types';
import { ADD_SYSTEM_PERMISSION_FORM_CONFIG } from '@features/settings-management/permission-management/system-permission-management/config/form/add-system-permission-form.config';

const EDIT_SYSTEM_PERMISSION_FIELDS_CONFIG: IFormInputFieldsConfig = {
  comment: ADD_SYSTEM_PERMISSION_FORM_CONFIG.fields['comment'],
};

const EDIT_SYSTEM_PERMISSION_BUTTONS_CONFIG: IFormButtonConfig = {
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

export const EDIT_SYSTEM_PERMISSION_FORM_CONFIG: IFormConfig = {
  fields: EDIT_SYSTEM_PERMISSION_FIELDS_CONFIG,
  buttons: EDIT_SYSTEM_PERMISSION_BUTTONS_CONFIG,
};
