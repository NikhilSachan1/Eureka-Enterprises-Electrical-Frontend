import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
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
import { IWalletRechargeAddUIFormDto } from '../../types/petro-card-wallet.dto';

const requiredUnlessCash = [
  {
    dependsOn: 'paymentMode',
    validators: [Validators.required],
    shouldApply: (mode: unknown): boolean =>
      String(mode ?? '').toLowerCase() !== 'cash',
  },
];

const ADD_WALLET_RECHARGE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IWalletRechargeAddUIFormDto> =
  {
    rechargeDate: {
      fieldType: EDataType.DATE,
      id: 'rechargeDate',
      fieldName: 'rechargeDate',
      label: 'Recharge Date',
      dateConfig: {
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    amount: {
      fieldType: EDataType.NUMBER,
      id: 'amount',
      fieldName: 'amount',
      label: 'Amount',
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      validators: [Validators.required, Validators.min(0.01)],
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
          exclude: ['petro_card', 'cash', 'system', 'cheque', 'credit_card'],
        },
        showClearButton: true,
      },
      validators: [Validators.required],
    },
    paidFromAccountId: {
      fieldType: EDataType.SELECT,
      id: 'paidFromAccountId',
      fieldName: 'paidFromAccountId',
      label: 'Paid From Account',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMPANY_BANK_ACCOUNT,
          dropdownName:
            CONFIGURATION_KEYS.COMPANY_BANK_ACCOUNT.COMPANY_BANK_ACCOUNT_LIST,
        },
        showClearButton: true,
      },
      conditionalValidators: requiredUnlessCash,
    },
    referenceNumber: {
      fieldType: EDataType.TEXT,
      id: 'referenceNumber',
      fieldName: 'referenceNumber',
      label: 'Reference / UTR',
      textConfig: {
        textCase: ETextCase.UPPERCASE,
        regex: TEXT_INPUT_ACCEPT_STRIP.ALPHANUMERIC,
        maximumInputLength: 100,
      },
      conditionalValidators: requiredUnlessCash,
    },
    remarks: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remarks',
      fieldName: 'remarks',
      label: 'Remarks',
    },
  };

const ADD_WALLET_RECHARGE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Record Recharge',
    tooltip: 'Add money to the PetroCard wallet',
  },
};

export const ADD_WALLET_RECHARGE_FORM_CONFIG: IFormConfig<IWalletRechargeAddUIFormDto> =
  {
    fields: ADD_WALLET_RECHARGE_FORM_FIELDS_CONFIG,
    buttons: ADD_WALLET_RECHARGE_FORM_BUTTONS_CONFIG,
  };
