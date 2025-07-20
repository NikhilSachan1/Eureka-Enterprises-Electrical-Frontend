import { Validators } from '@angular/forms';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
} from '@shared/models';
import { EFieldType, EButtonSeverity } from '@shared/types';

const ROLE_FORM_ADD_FIELDS_CONFIG: IFormInputFieldsConfig = {
  roleName: {
    fieldType: EFieldType.Text,
    id: 'roleName',
    fieldName: 'roleName',
    label: 'Role Name',
    validators: [Validators.required, Validators.minLength(2)],
  },

  comment: {
    fieldType: EFieldType.TextArea,
    id: 'comment',
    fieldName: 'comment',
    label: 'Description',
    validators: [Validators.required, Validators.minLength(10)],
  },
};

const ROLE_FORM_ADD_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
    tooltip: 'Reset the form',
  },
  submit: {
    label: 'Create Role',
    type: 'submit',
    severity: EButtonSeverity.PRIMARY,
    tooltip: 'Add a new role to the system',
  },
};

export const ROLE_FORM_ADD_CONFIG: IFormConfig = {
  fields: ROLE_FORM_ADD_FIELDS_CONFIG,
  buttons: ROLE_FORM_ADD_BUTTONS_CONFIG,
};
