import { AbstractControl, Validators } from '@angular/forms';
import { IEmployeeResetPasswordFormDto } from '@features/employee-management/types/employee.dto';
import { EDataType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

const RESET_PASSWORD_EMPLOYEE_FIELDS_CONFIG: IFormInputFieldsConfig<IEmployeeResetPasswordFormDto> =
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
        promptLabel: 'Enter a new password',
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
      validators: [
        Validators.required,
        Validators.minLength(8),
        (control: AbstractControl) => {
          const newPassword = control.parent?.get('newPassword')?.value;
          if (!control.value || !newPassword) {
            return null;
          }
          return control.value === newPassword ? null : { mismatch: true };
        },
      ],
      passwordConfig: {
        toggleMask: true,
      },
    },
  };

export const RESET_PASSWORD_EMPLOYEE_FORM_CONFIG: IFormConfig<IEmployeeResetPasswordFormDto> =
  {
    fields: RESET_PASSWORD_EMPLOYEE_FIELDS_CONFIG,
  };
