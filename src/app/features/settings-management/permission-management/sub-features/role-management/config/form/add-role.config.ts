import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
  EDataType,
} from '@shared/types';
import { IRoleAddFormDto } from '../../types/role.dto';

const ADD_ROLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRoleAddFormDto> = {
  roleName: {
    fieldType: EDataType.TEXT,
    id: 'roleName',
    fieldName: 'roleName',
    label: 'Role Name',
    validators: [Validators.required, Validators.minLength(2)],
  },

  roleDescription: {
    fieldType: EDataType.TEXT_AREA,
    id: 'roleDescription',
    fieldName: 'roleDescription',
    label: 'Role Description',
    validators: [Validators.required, Validators.minLength(10)],
  },
};

const ADD_ROLE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Create Role',
    tooltip: 'Add a new role to the system',
  },
};

export const ADD_ROLE_FORM_CONFIG: IFormConfig<IRoleAddFormDto> = {
  fields: ADD_ROLE_FORM_FIELDS_CONFIG,
  buttons: ADD_ROLE_FORM_BUTTONS_CONFIG,
};
