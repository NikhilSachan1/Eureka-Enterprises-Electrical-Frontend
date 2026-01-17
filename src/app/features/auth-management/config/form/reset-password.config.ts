import { Validators } from '@angular/forms';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
  EDataType,
  EButtonSize,
  EButtonSeverity,
} from '@shared/types';
import { IResetPasswordFormDto } from '../../types/auth.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const RESET_PASSWORD_FIELDS_CONFIG: IFormInputFieldsConfig<IResetPasswordFormDto> =
  {
    newPassword: {
      fieldType: EDataType.PASSWORD,
      id: 'newPassword',
      fieldName: 'newPassword',
      label: 'New Password',
      validators: [Validators.required, Validators.minLength(8)],
      passwordConfig: {
        feedback: true,
        toggleMask: true,
        promptLabel: 'Enter your new password',
        weakLabel: 'Too simple',
        mediumLabel: 'Average complexity',
        strongLabel: 'Complex password',
      },
    },
    confirmPassword: {
      fieldType: EDataType.PASSWORD,
      id: 'confirmPassword',
      fieldName: 'confirmPassword',
      label: 'Confirm Password',
      validators: [Validators.required, Validators.minLength(8)],
    },
  };

const RESET_PASSWORD_BUTTONS_CONFIG: IFormButtonConfig = {
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Reset Password',
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

export const RESET_PASSWORD_FORM_CONFIG: IFormConfig<IResetPasswordFormDto> = {
  fields: RESET_PASSWORD_FIELDS_CONFIG,
  buttons: RESET_PASSWORD_BUTTONS_CONFIG,
};
