import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../shared/models/input-fields-config.model';
import { EFieldType, EFieldSize, EAutocomplete } from '../../../shared/types/form-input.types';

export const LOGIN_INPUT_FIELDS_CONFIG: IFormConfig = {
  username: {
    fieldType: EFieldType.Text,
    id: 'username',
    fieldName: 'username',
    label: 'Username or Email',
    fieldSize: EFieldSize.Large,
    haveFullWidth: true,
    autocomplete: EAutocomplete.On,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
  },
  password: {
    fieldType: EFieldType.Password,
    id: 'password',
    fieldName: 'password',
    label: 'Password',
    fieldSize: EFieldSize.Large,
    haveFullWidth: true,
    autocomplete: EAutocomplete.On,
    validators: [Validators.required, Validators.minLength(6)],
    passwordConfig: {
      feedback: true,
      toggleMask: true,
      promptLabel: 'Enter your password',
      weakLabel: 'Too simple',
      mediumLabel: 'Average complexity',
      strongLabel: 'Complex password'
    }
  },
  rememberMe: {
    fieldType: EFieldType.Checkbox,
    id: 'remember-me',
    fieldName: 'rememberMe',
    fieldSize: EFieldSize.Large,
    checkboxConfig: {
      options: [{value: 'Remember me', key: 'rememberMe'}],
      binary: true,
    },
  }
}; 