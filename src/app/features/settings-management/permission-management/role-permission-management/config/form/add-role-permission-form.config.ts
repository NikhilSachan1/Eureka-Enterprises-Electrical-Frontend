import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig, IFormButtonConfig } from '../../../../../../shared/models';
import { EFieldType, EButtonSize, EButtonSeverity } from '../../../../../../shared/types';

const ADD_ROLE_PERMISSION_FIELDS_CONFIG: IFormInputFieldsConfig = {
  roleName: {
    fieldType: EFieldType.Text,
    id: 'roleName',
    fieldName: 'roleName',
    label: 'Role Name',
    validators: [Validators.required, Validators.minLength(3)],
  },

  description: {
    fieldType: EFieldType.TextArea,
    id: 'description',
    fieldName: 'description',
    label: 'Description',
    validators: [Validators.required, Validators.minLength(10)],
  },
};

const ADD_ROLE_PERMISSION_BUTTONS_CONFIG: IFormButtonConfig = {
  cancel: {
    label: 'Reset',
    severity: EButtonSeverity.SECONDARY,
  },
  submit: {
    label: 'Create Role',
    severity: EButtonSeverity.PRIMARY,
  }
};

export const ADD_ROLE_PERMISSION_INPUT_FIELDS_CONFIG: IFormConfig = {
  fields: ADD_ROLE_PERMISSION_FIELDS_CONFIG,
  buttons: ADD_ROLE_PERMISSION_BUTTONS_CONFIG,
}; 