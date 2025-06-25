import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../../../shared/models';
import { EFieldType } from '../../../../../../shared/types';

export const ADD_ROLE_PERMISSION_INPUT_FIELDS_CONFIG: IFormConfig = {

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