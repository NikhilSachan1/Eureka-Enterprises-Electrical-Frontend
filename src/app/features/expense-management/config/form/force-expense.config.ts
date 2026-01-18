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
import { IExpenseForceFormDto } from '@features/expense-management/types/expense.dto';

const {
  fields: {
    expenseCategory,
    paymentMode,
    expenseDate,
    expenseAmount,
    remark,
    expenseAttachments,
    transactionId,
  },
} = ADD_EXPENSE_FORM_CONFIG;

const financialYearService = new FinancialYearService();

const FORCE_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IExpenseForceFormDto> =
  {
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
    expenseCategory,
    paymentMode,
    expenseDate: {
      ...expenseDate,
      dateConfig: {
        ...expenseDate.dateConfig,
        minDate: financialYearService.getFinancialYearStartDate(),
      },
    },
    expenseAmount,
    remark,
    transactionId,
    expenseAttachments,
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

export const FORCE_EXPENSE_FORM_CONFIG: IFormConfig<IExpenseForceFormDto> = {
  fields: FORCE_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: FORCE_EXPENSE_FORM_BUTTONS_CONFIG,
};
