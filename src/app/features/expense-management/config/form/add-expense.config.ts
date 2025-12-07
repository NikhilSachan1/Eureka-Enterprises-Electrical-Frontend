import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EXPENSE_CATEGORY_DATA,
  EXPENSE_PAYMENT_METHOD_DATA,
} from '@shared/config/static-data.config';
import {
  EFieldType,
  EInputNumberMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ADD_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  expenseType: {
    fieldType: EFieldType.Select,
    id: 'expenseType',
    fieldName: 'expenseType',
    label: 'Expense Type',
    selectConfig: {
      optionsDropdown: EXPENSE_CATEGORY_DATA,
    },
    validators: [Validators.required],
  },
  paymentMode: {
    fieldType: EFieldType.Select,
    id: 'paymentMode',
    fieldName: 'paymentMode',
    label: 'Payment Mode',
    selectConfig: {
      optionsDropdown: EXPENSE_PAYMENT_METHOD_DATA,
    },
    validators: [Validators.required],
  },
  expenseDate: {
    fieldType: EFieldType.Date,
    id: 'expenseDate',
    fieldName: 'expenseDate',
    label: 'Date of Expense',
    dateConfig: {
      //   minDate: calculateMinEditableDate(PAYSLIP_DATE_DATA.EVERY_MONTH),
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  expenseAmount: {
    fieldType: EFieldType.Number,
    id: 'expenseAmount',
    fieldName: 'expenseAmount',
    label: 'Expense Amount',
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    validators: [Validators.required],
  },
  description: {
    fieldType: EFieldType.TextArea,
    id: 'description',
    fieldName: 'description',
    label: 'Description',
    validators: [Validators.required],
  },
  attachment: {
    fieldType: EFieldType.File,
    id: 'attachment',
    fieldName: 'attachment',
    label: 'Attachment',
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
