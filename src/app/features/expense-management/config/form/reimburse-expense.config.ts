import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { Validators } from '@angular/forms';
import { FORCE_EXPENSE_FORM_CONFIG } from './force-expense.config';

const {
  fields: {
    employeeName,
    paymentMode,
    expenseDate,
    expenseAmount,
    description,
    attachment,
    transactionId,
  },
} = FORCE_EXPENSE_FORM_CONFIG;

const REIMBURSE_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  employeeName,
  paymentMode,
  expenseDate,
  expenseAmount,
  description,
  attachment,
  transactionId: {
    ...transactionId,
    validators: [Validators.required],
  },
};

const REIMBURSE_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Reimburse Expense',
    tooltip: 'Reimburse expense',
  },
};

export const REIMBURSE_EXPENSE_FORM_CONFIG: IFormConfig = {
  fields: REIMBURSE_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: REIMBURSE_EXPENSE_FORM_BUTTONS_CONFIG,
};
