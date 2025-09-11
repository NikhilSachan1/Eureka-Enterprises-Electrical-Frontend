import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
} from '@shared/models';
import { EFieldType } from '@shared/types';

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
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Create Role',
    tooltip: 'Add a new role to the system',
  },
};

export const ROLE_FORM_ADD_CONFIG: IFormConfig = {
  fields: ROLE_FORM_ADD_FIELDS_CONFIG,
  buttons: ROLE_FORM_ADD_BUTTONS_CONFIG,
};
