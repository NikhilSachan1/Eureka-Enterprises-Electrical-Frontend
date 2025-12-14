import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_EXPENSE_FORM_CONFIG } from './add-expense.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';

const {
  fields: {
    expenseType,
    paymentMode,
    expenseDate,
    expenseAmount,
    description,
    attachment,
  },
} = ADD_EXPENSE_FORM_CONFIG;

const EDIT_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  expenseType,
  paymentMode,
  expenseDate,
  expenseAmount,
  description,
  attachment,
};

const EDIT_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Expense',
    tooltip: 'Edit expense',
  },
};

export const EDIT_EXPENSE_FORM_CONFIG: IFormConfig = {
  fields: EDIT_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: EDIT_EXPENSE_FORM_BUTTONS_CONFIG,
};
