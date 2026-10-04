import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteWalletRechargeComponent } from '../../components/delete-wallet-recharge/delete-wallet-recharge.component';

export const WALLET_RECHARGE_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteWalletRechargeComponent,
  },
};
