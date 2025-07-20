import { Validators } from '@angular/forms';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
} from '@shared/models';
import { EFieldType, EButtonSeverity } from '@shared/types';

const ADD_ROLE_FIELDS_CONFIG: IFormInputFieldsConfig = {
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

const ADD_ROLE_BUTTONS_CONFIG: IFormButtonConfig = {
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

export const ADD_ROLE_FORM_CONFIG: IFormConfig = {
  fields: ADD_ROLE_FIELDS_CONFIG,
  buttons: ADD_ROLE_BUTTONS_CONFIG,
};
