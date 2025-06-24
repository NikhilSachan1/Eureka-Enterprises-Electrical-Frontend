import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../shared/models/input-fields-config.model';
import { EFieldType, EFieldSize, EAutocomplete } from '../../../shared/types/form-input.types';

export const LOGIN_INPUT_FIELDS_CONFIG: IFormConfig = {
  email: {
    fieldType: EFieldType.Text,
    id: 'email',
    fieldName: 'email',
    label: 'Email',
    validators: [Validators.required, Validators.email],
  },
  password: {
    fieldType: EFieldType.Password,
    id: 'password',
    fieldName: 'password',
    label: 'Password',
    validators: [Validators.required, Validators.minLength(6)],
    passwordConfig: {
      feedback: false,
    }
  },
  rememberMe: {
    fieldType: EFieldType.Checkbox,
    id: 'remember-me',
    fieldName: 'rememberMe',
    fieldSize: EFieldSize.Large,
    checkboxConfig: {
      options: [{label: 'Remember me', value: 'rememberMe'}],
      binary: true,
    },
  }
}; 