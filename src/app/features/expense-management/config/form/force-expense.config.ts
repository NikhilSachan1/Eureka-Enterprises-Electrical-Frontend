import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_EXPENSE_FORM_CONFIG } from './add-expense.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { Validators } from '@angular/forms';
import { FinancialYearService } from '@core/services/financial-year.service';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';

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
    fieldType: EDataType.SELECT,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EMPLOYEE,
        dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
      },
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
