import {
  EFieldType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_EXPENSE_FORM_CONFIG } from './add-expense.config';
import { COMMON_FORM_ACTIONS, EMPLOYEE_NAME_DATA } from '@shared/config';
import { Validators } from '@angular/forms';
import { FinancialYearService } from '@core/services/financial-year.service';

const {
  fields: {
    expenseType,
    paymentMode,
    expenseDate,
    expenseAmount,
    description,
    attachment,
    transactionId,
  },
} = ADD_EXPENSE_FORM_CONFIG;

const financialYearService = new FinancialYearService();

const FORCE_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  employeeName: {
    fieldType: EFieldType.Select,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    selectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    validators: [Validators.required],
  },
  expenseType,
  paymentMode,
  expenseDate: {
    ...expenseDate,
    dateConfig: {
      ...expenseDate.dateConfig,
      minDate: financialYearService.getFinancialYearStartDate(),
    },
  },
  expenseAmount,
  description,
  transactionId,
  attachment,
};

const FORCE_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force Expense',
    tooltip: 'Force expense',
  },
};

export const FORCE_EXPENSE_FORM_CONFIG: IFormConfig = {
  fields: FORCE_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: FORCE_EXPENSE_FORM_BUTTONS_CONFIG,
};
