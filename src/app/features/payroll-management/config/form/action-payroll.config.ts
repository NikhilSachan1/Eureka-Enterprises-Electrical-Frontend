import { Validators } from '@angular/forms';
import { IActionPayrollFormDto } from '@features/payroll-management/types/payroll.dto';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ACTION_PAYROLL_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  Partial<IActionPayrollFormDto>
> = {
  comment: {
    fieldType: EDataType.TEXT_AREA,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          const { actionType } = context;
          return actionType === EButtonActionType.CANCEL;
        },
        validators: [Validators.required],
      },
    ],
  },
};

export const ACTION_PAYROLL_FORM_CONFIG: IFormConfig<
  Partial<IActionPayrollFormDto>
> = {
  fields: ACTION_PAYROLL_FORM_FIELDS_CONFIG,
};
