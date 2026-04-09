import { Validators } from '@angular/forms';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
  EDataType,
  EButtonSize,
  EButtonSeverity,
} from '@shared/types';
import { IForgetPasswordFormDto } from '../../types/auth.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const FORGOT_PASSWORD_FIELDS_CONFIG: IFormInputFieldsConfig<IForgetPasswordFormDto> =
  {
    email: {
      fieldType: EDataType.TEXT,
      id: 'email',
      fieldName: 'email',
      label: 'Email Address',
      validators: [Validators.required],
    },
  };

const FORGOT_PASSWORD_BUTTONS_CONFIG: IFormButtonConfig = {
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Send Reset Link',
    size: EButtonSize.LARGE,
    fluid: true,
  },
  backToLogin: {
    label: 'Back to Login',
    link: true,
    size: EButtonSize.SMALL,
    severity: EButtonSeverity.PRIMARY,
  },
};

export const FORGOT_PASSWORD_FORM_CONFIG: IFormConfig<IForgetPasswordFormDto> =
  {
    fields: FORGOT_PASSWORD_FIELDS_CONFIG,
    buttons: FORGOT_PASSWORD_BUTTONS_CONFIG,
  };
