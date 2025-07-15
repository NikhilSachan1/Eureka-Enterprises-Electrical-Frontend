import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig, IFormButtonConfig } from '@shared/models';
import { EFieldType, EFieldSize, EAutocomplete, EButtonSize, EButtonSeverity } from '@shared/types';

const FORGOT_PASSWORD_FIELDS_CONFIG: IFormInputFieldsConfig = {
  email: {
    fieldType: EFieldType.Text,
    id: 'email',
    fieldName: 'email',
    label: 'Email Address',
    fieldSize: EFieldSize.Large,
    haveFullWidth: true,
    autocomplete: EAutocomplete.On,
    validators: [Validators.required, Validators.email],
  }
};

const FORGOT_PASSWORD_BUTTONS_CONFIG: IFormButtonConfig = {
  submit: {
    label: 'Send Reset Link',
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

export const FORGOT_PASSWORD_INPUT_FIELDS_CONFIG: IFormConfig = {
  fields: FORGOT_PASSWORD_FIELDS_CONFIG,
  buttons: FORGOT_PASSWORD_BUTTONS_CONFIG,
}; 