import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EXPENSE_CATEGORY_DATA,
  EXPENSE_PAYMENT_METHOD_DATA,
} from '@shared/config/static-data.config';
import {
  EDataType,
  EInputNumberMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import {
  filterOptionsByIncludeExclude,
  getDateBeforeXDays,
} from '@shared/utility';

const ADD_EXPENSE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  expenseType: {
    fieldType: EDataType.SELECT,
    id: 'expenseType',
    fieldName: 'expenseType',
    label: 'Expense Type',
    selectConfig: {
      optionsDropdown: filterOptionsByIncludeExclude(
        EXPENSE_CATEGORY_DATA,
        [],
        ['settlement']
      ),
    },
    validators: [Validators.required],
  },
  paymentMode: {
    fieldType: EDataType.SELECT,
    id: 'paymentMode',
    fieldName: 'paymentMode',
    label: 'Payment Mode',
    selectConfig: {
      optionsDropdown: EXPENSE_PAYMENT_METHOD_DATA,
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
