import { Validators } from '@angular/forms';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
  EDataType,
  EFieldSize,
  EButtonSize,
  EButtonSeverity,
} from '@shared/types';
import { ILoginFormDto } from '../../types/auth.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const LOGIN_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ILoginFormDto> = {
  email: {
    fieldType: EDataType.TEXT,
    id: 'email',
    fieldName: 'email',
    label: 'Email',
    validators: [Validators.required, Validators.email],
  },
  password: {
    fieldType: EDataType.PASSWORD,
    id: 'password',
    fieldName: 'password',
    label: 'Password',
    validators: [Validators.required, Validators.minLength(6)],
    passwordConfig: {
      feedback: false,
    },
  },
  rememberMe: {
    fieldType: EDataType.CHECKBOX,
    id: 'remember-me',
    fieldName: 'rememberMe',
    fieldSize: EFieldSize.Large,
    checkboxConfig: {
      options: [{ label: 'Remember me', value: 'rememberMe' }],
      binary: true,
    },
  },
};

const LOGIN_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  forgotPassword: {
    label: 'Forgot password?',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  },
  signIn: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Sign in',
    size: EButtonSize.LARGE,
    fluid: true,
  },
  contactAdmin: {
    label: 'Contact Administrator',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  },
};

export const LOGIN_FORM_CONFIG: IFormConfig<ILoginFormDto> = {
  fields: LOGIN_FORM_FIELDS_CONFIG,
  buttons: LOGIN_FORM_BUTTONS_CONFIG,
};
