import { Validators } from '@angular/forms';
import { IExpenseActionUIFormDto } from '@features/expense-management/types/expense.dto';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IExpenseActionUIFormDto> =
  {
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Remark',
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { actionType } = context;
            return actionType === EButtonActionType.REJECT;
          },
          validators: [Validators.required],
        },
      ],
    },
  };

export const APPROVAL_ACTION_EXPENSE_FORM_CONFIG: IFormConfig<IExpenseActionUIFormDto> =
  {
    fields: APPROVAL_ACTION_EXPENSE_FORM_FIELDS_CONFIG,
  };
