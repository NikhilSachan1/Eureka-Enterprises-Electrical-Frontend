import { Validators } from '@angular/forms';
import { IFormButtonConfig, IFormConfig, IFormInputFieldsConfig } from '../../../shared/models';
import { EFieldType, EFieldSize, EButtonSize, EButtonSeverity } from '../../../shared/types';

const LOGIN_FIELDS_CONFIG: IFormInputFieldsConfig = {
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

const LOGIN_BUTTONS_CONFIG: IFormButtonConfig = {
  forgotPassword: {
    label: 'Forgot password?',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  },
  signIn: {
    label: 'Sign in',
    type: 'submit',
    size: EButtonSize.LARGE,
    severity: EButtonSeverity.PRIMARY,
    fluid: true,
  },
  contactAdmin: {
    label: 'Contact Administrator',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  }
};

export const LOGIN_FORM_CONFIG: IFormConfig = {
  fields: LOGIN_FIELDS_CONFIG,
  buttons: LOGIN_BUTTONS_CONFIG,
};