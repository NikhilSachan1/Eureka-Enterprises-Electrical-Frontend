import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { IWalletRechargeEditUIFormDto } from '../../types/petro-card-wallet.dto';
import { ADD_WALLET_RECHARGE_FORM_CONFIG } from './add-wallet-recharge.config';

const EDIT_WALLET_RECHARGE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IWalletRechargeEditUIFormDto> =
  {
    ...ADD_WALLET_RECHARGE_FORM_CONFIG.fields,
  };

const EDIT_WALLET_RECHARGE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Recharge',
    tooltip: 'Correct this wallet recharge',
  },
};

export const EDIT_WALLET_RECHARGE_FORM_CONFIG: IFormConfig<IWalletRechargeEditUIFormDto> =
  {
    fields: EDIT_WALLET_RECHARGE_FORM_FIELDS_CONFIG,
    buttons: EDIT_WALLET_RECHARGE_FORM_BUTTONS_CONFIG,
  };
