import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { Validators } from '@angular/forms';
import { FORCE_EXPENSE_FORM_CONFIG } from './force-expense.config';
import { IExpenseReimburseFormDto } from '@features/expense-management/types/expense.dto';

const {
  fields: {
    employeeName,
    paymentMode,
    expenseDate,
    expenseAmount,
    remark,
    expenseAttachments,
    transactionId,
  },
} = FORCE_EXPENSE_FORM_CONFIG;

const REIMBURSE_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IExpenseReimburseFormDto> =
  {
    employeeName,
    paymentMode,
    expenseDate,
    expenseAmount,
    remark,
    expenseAttachments,
    transactionId: {
      ...transactionId,
      validators: [Validators.required, ...(transactionId?.validators ?? [])],
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

export const REIMBURSE_EXPENSE_FORM_CONFIG: IFormConfig<IExpenseReimburseFormDto> =
  {
    fields: REIMBURSE_EXPENSE_FORM_FIELDS_CONFIG,
    buttons: REIMBURSE_EXPENSE_FORM_BUTTONS_CONFIG,
  };
