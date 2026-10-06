import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  EInputNumberMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IWalletRechargeAddUIFormDto } from '../../types/petro-card-wallet.dto';

/** Manual recharge: amount + rechargeDate required; optional remarks only. */
const ADD_WALLET_RECHARGE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IWalletRechargeAddUIFormDto> =
  {
    rechargeDate: {
      fieldType: EDataType.DATE,
      id: 'rechargeDate',
      fieldName: 'rechargeDate',
      label: 'Recharge Date',
      dateConfig: {
        maxDate: new Date(),
        touchUI: false,
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
