import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EButtonSeverity } from '@shared/types';

export const ROLE_PERMISSION_FORM_SET_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset permissions',
  },
  submit: {
    label: 'Save Permissions',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Save permissions',
  },
};

export const ROLE_PERMISSION_FORM_SET_CONFIG: IFormConfig = {
  fields: {} as IFormInputFieldsConfig,
  buttons: ROLE_PERMISSION_FORM_SET_BUTTONS_CONFIG,
};
