import { Validators } from '@angular/forms';
import { FinancialYearService } from '@core/services/financial-year.service';
import { REIMBURSE_EXPENSE_FORM_CONFIG } from '@features/expense-management/config/form/reimburse-expense.config';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  TEXT_INPUT_ACCEPT_STRIP,
} from '@shared/constants';
import {
  EDataType,
  ETextCase,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IPayPaymentSheetItemFormDto } from '../../types/payment-sheet.dto';

const {
  fields: { paymentMode },
} = REIMBURSE_EXPENSE_FORM_CONFIG;

const financialYearService = new FinancialYearService();

const PAY_PAYMENT_SHEET_ITEM_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IPayPaymentSheetItemFormDto> =
  {
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
    paidDate: {
      fieldType: EDataType.DATE,
      id: 'paidDate',
      fieldName: 'paidDate',
      label: 'Paid Date',
      dateConfig: {
        minDate: financialYearService.getFinancialYearStartDate(),
        touchUI: false,
      },
      validators: [Validators.required],
    },
    transactionId: {
      fieldType: EDataType.TEXT,
      id: 'transactionId',
      fieldName: 'transactionId',
      label: 'Transaction ID / UTR Number',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
        maximumInputLength: 32,
      },
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(32),
      ],
    },
  };

export const PAY_PAYMENT_SHEET_ITEM_FORM_CONFIG: IFormConfig<IPayPaymentSheetItemFormDto> =
  {
    fields: PAY_PAYMENT_SHEET_ITEM_FORM_FIELDS_CONFIG,
  };
