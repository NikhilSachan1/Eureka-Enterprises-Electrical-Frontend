import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig, IFormButtonConfig } from '@shared/models';
import { EFieldType, EFieldSize, EAutocomplete, EButtonSize, EButtonSeverity } from '@shared/types';

const RESET_PASSWORD_FIELDS_CONFIG: IFormInputFieldsConfig = {
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

const RESET_PASSWORD_BUTTONS_CONFIG: IFormButtonConfig = {
  submit: {
    label: 'Reset Password',
    type: 'submit',
    size: EButtonSize.LARGE,
    severity: EButtonSeverity.PRIMARY,
    fluid: true,
  },
  backToLogin: {
    label: 'Back to Login',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  }
};

export const RESET_PASSWORD_INPUT_FIELDS_CONFIG: IFormConfig = {
  fields: RESET_PASSWORD_FIELDS_CONFIG,
  buttons: RESET_PASSWORD_BUTTONS_CONFIG,
}; 