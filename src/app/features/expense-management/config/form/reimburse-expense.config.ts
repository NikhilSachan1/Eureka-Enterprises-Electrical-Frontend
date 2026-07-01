import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
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
    paidFromAccount: {
      fieldType: EDataType.SELECT,
      id: 'paidFromAccount',
      fieldName: 'paidFromAccount',
      label: 'Paid From Account',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY_BANK_ACCOUNT,
          dropdownName:
            CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
        },
        showClearButton: true,
      },
      conditionalValidators: [
        {
          dependsOn: 'paymentMode',
          validators: [Validators.required],
          shouldApply: (mode: unknown): boolean =>
            String(mode ?? '').toLowerCase() !== 'cash',
          resetOnFalse: true,
        },
      ],
    },
    expenseDate,
    expenseAmount,
    remark: {
      ...remark,
      validators: [],
    },
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
