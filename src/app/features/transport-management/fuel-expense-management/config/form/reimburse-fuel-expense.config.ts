import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { Validators } from '@angular/forms';
import { IFuelExpenseReimburseFormDto } from '../../types/fuel-expense.dto';
import { FORCE_FUEL_EXPENSE_FORM_CONFIG } from './force-fuel-expense.config';

const {
  fields: {
    employeeName,
    transactionId,
    fuelAmount,
    fuelFillDate,
    remark,
    fuelExpenseAttachments,
    paymentMode,
  },
} = FORCE_FUEL_EXPENSE_FORM_CONFIG;

const REIMBURSE_FUEL_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IFuelExpenseReimburseFormDto> =
  {
    employeeName,
    paymentMode,
    fuelAmount,
    fuelFillDate,
    remark,
    fuelExpenseAttachments,
    transactionId: {
      ...transactionId,
      validators: [Validators.required, ...(transactionId?.validators ?? [])],
    },
  };

const REIMBURSE_FUEL_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Reimburse Fuel Expense',
    tooltip: 'Reimburse fuel expense',
  },
};

export const REIMBURSE_FUEL_EXPENSE_FORM_CONFIG: IFormConfig<IFuelExpenseReimburseFormDto> =
  {
    fields: REIMBURSE_FUEL_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: REIMBURSE_FUEL_EXPENSE_FORM_BUTTONS_CONFIG,
  };
