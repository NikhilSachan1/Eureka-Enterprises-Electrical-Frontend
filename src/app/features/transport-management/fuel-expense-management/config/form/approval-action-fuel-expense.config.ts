import { Validators } from '@angular/forms';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IFuelExpenseActionUIFormDto } from '../../types/fuel-expense.dto';

const APPROVAL_ACTION_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseActionUIFormDto> =
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

export const APPROVAL_ACTION_FUEL_EXPENSE_FORM_CONFIG: IFormConfig<IFuelExpenseActionUIFormDto> =
  {
    fields: APPROVAL_ACTION_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
  };
