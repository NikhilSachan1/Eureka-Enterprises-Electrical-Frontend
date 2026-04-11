import { Validators } from '@angular/forms';
import { FinancialYearService } from '@core/services/financial-year.service';
import { APP_CONFIG } from '@core/config';
import { EExpenseCategory } from '@features/expense-management/types/expense.enum';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { getDateBeforeXDays } from '@shared/utility';
import { IExpenseAddFormDto } from '@features/expense-management/types/expense.dto';

const financialYearService = new FinancialYearService();

const ADD_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IExpenseAddFormDto> =
  {
    expenseCategory: {
      fieldType: EDataType.SELECT,
      id: 'expenseCategory',
      fieldName: 'expenseCategory',
      label: 'Expense Type',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EXPENSE,
          dropdownName: CONFIGURATION_KEYS.EXPENSE.CATEGORIES,
        },
        filterOptions: {
          exclude: [
            EExpenseCategory.SETTLEMENT,
            'LEAVE_ENCASHMENT',
            'FNF_SETTLEMENT',
            'FNF_GRATUITY',
            'PERFORMANCE_BONUS',
          ],
        },
      },
      validators: [Validators.required],
    },
    paymentMode: {
      fieldType: EDataType.SELECT,
      id: 'paymentMode',
      fieldName: 'paymentMode',
      label: 'Payment Mode',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EXPENSE,
          dropdownName: CONFIGURATION_KEYS.EXPENSE.PAYMENT_METHODS,
        },
        filterOptions: {
          exclude: ['cheque ', 'neft/imps', 'system', 'rtgs'],
        },
      },
      validators: [Validators.required],
    },
    expenseDate: {
      fieldType: EDataType.DATE,
      id: 'expenseDate',
      fieldName: 'expenseDate',
      label: 'Date of Expense',
      dateConfig: {
        minDate: new Date(
          Math.max(
            getDateBeforeXDays(6).getTime(),
            financialYearService.getFinancialYearStartDate().getTime()
          )
        ),
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    expenseAmount: {
      fieldType: EDataType.NUMBER,
      id: 'expenseAmount',
      fieldName: 'expenseAmount',
      label: 'Expense Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required, Validators.min(1)],
    },
    transactionId: {
      fieldType: EDataType.TEXT,
      id: 'transactionId',
      fieldName: 'transactionId',
      label: 'Transaction ID / Receipt Number / UTR Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
        maximumInputLength: 32,
      },
      validators: [Validators.minLength(6), Validators.maxLength(32)],
    },
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Note',
      validators: [Validators.required],
    },
    expenseAttachments: {
      fieldType: EDataType.ATTACHMENTS,
      id: 'expenseAttachments',
      fieldName: 'expenseAttachments',
      label: 'Expense Attachments',
      fileConfig: {
        fileLimit: 2,
        acceptFileTypes: [
          ...APP_CONFIG.MEDIA_CONFIG.IMAGE,
          ...APP_CONFIG.MEDIA_CONFIG.PDF,
        ],
      },
      validators: [Validators.required],
    },
  };

const ADD_EXPENSE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Expense',
    tooltip: 'Add a new expense',
  },
};

export const ADD_EXPENSE_FORM_CONFIG: IFormConfig<IExpenseAddFormDto> = {
  fields: ADD_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: ADD_EXPENSE_FORM_BUTTONS_CONFIG,
};
