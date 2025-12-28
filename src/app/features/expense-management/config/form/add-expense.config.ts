import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { EExpenseCategory } from '@features/expense-management/types/expense.enum';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES, REGEX } from '@shared/constants';
import {
  EDataType,
  EInputNumberMode,
  ETextCase,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { getDateBeforeXDays, withCustomMessage } from '@shared/utility';

const ADD_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  expenseType: {
    fieldType: EDataType.SELECT,
    id: 'expenseType',
    fieldName: 'expenseType',
    label: 'Expense Type',
    selectConfig: {
      dynamicDropdown: {
        moduleName: MODULE_NAMES.EXPENSE,
        dropdownName: CONFIGURATION_KEYS.EXPENSE.CATEGORIES,
      },
      filterOptions: {
        exclude: [EExpenseCategory.SETTLEMENT],
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
    },
    validators: [Validators.required],
  },
  expenseDate: {
    fieldType: EDataType.DATE,
    id: 'expenseDate',
    fieldName: 'expenseDate',
    label: 'Date of Expense',
    dateConfig: {
      minDate: getDateBeforeXDays(6),
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
    },
    validators: [
      Validators.minLength(6),
      Validators.maxLength(32),
      withCustomMessage(
        Validators.pattern(REGEX.ALPHANUMERIC),
        'Invalid transaction ID / Receipt Number / UTR Number'
      ),
    ],
  },
  description: {
    fieldType: EDataType.TEXT_AREA,
    id: 'description',
    fieldName: 'description',
    label: 'Description',
    validators: [Validators.required],
  },
  attachment: {
    fieldType: EDataType.ATTACHMENTS,
    id: 'attachment',
    fieldName: 'attachment',
    label: 'Attachment',
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

export const ADD_EXPENSE_FORM_CONFIG: IFormConfig = {
  fields: ADD_EXPENSE_FORM_FIELDS_CONFIG,
  buttons: ADD_EXPENSE_FORM_BUTTONS_CONFIG,
};
