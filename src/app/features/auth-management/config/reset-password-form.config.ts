import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../shared/models/input-fields-config.model';
import { EFieldType, EFieldSize, EAutocomplete } from '../../../shared/types/form-input.types';

export const RESET_PASSWORD_INPUT_FIELDS_CONFIG: IFormConfig = {
  password: {
    fieldType: EFieldType.Password,
    id: 'password',
    fieldName: 'password',
    label: 'New Password',
    fieldSize: EFieldSize.Large,
    haveFullWidth: true,
    autocomplete: EAutocomplete.Off,
    validators: [Validators.required, Validators.minLength(8)],
    passwordConfig: {
      feedback: true,
      toggleMask: true,
      promptLabel: 'Enter your new password',
      weakLabel: 'Too simple',
      mediumLabel: 'Average complexity',
      strongLabel: 'Complex password'
    }
  },
  confirmPassword: {
    fieldType: EFieldType.Password,
    id: 'confirmPassword',
    fieldName: 'confirmPassword',
    label: 'Confirm New Password',
    fieldSize: EFieldSize.Large,
    haveFullWidth: true,
    autocomplete: EAutocomplete.Off,
    validators: [Validators.required, Validators.minLength(8)],
    passwordConfig: {
      feedback: true,
      toggleMask: true,
      promptLabel: 'Confirm your new password',
      weakLabel: 'Too simple',
      mediumLabel: 'Average complexity',
      strongLabel: 'Complex password'
    }
  }
}; 