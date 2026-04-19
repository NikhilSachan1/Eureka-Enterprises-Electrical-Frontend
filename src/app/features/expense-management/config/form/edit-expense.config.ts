import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_EXPENSE_FORM_CONFIG } from './add-expense.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IExpenseEditFormDto } from '@features/expense-management/types/expense.dto';

const EDIT_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IExpenseEditFormDto> =
  {
    ...ADD_EXPENSE_FORM_CONFIG.fields,
  };

const EDIT_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Expense',
    tooltip: 'Update expense',
  },
};

export const EDIT_EXPENSE_FORM_CONFIG: IFormConfig<IExpenseEditFormDto> = {
  fields: EDIT_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: EDIT_EXPENSE_FORM_BUTTONS_CONFIG,
};
