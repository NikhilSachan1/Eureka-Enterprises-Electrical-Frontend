import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { AddWalletRechargeComponent } from '../../components/add-wallet-recharge/add-wallet-recharge.component';
import { DeleteWalletRechargeComponent } from '../../components/delete-wallet-recharge/delete-wallet-recharge.component';
import { EditWalletRechargeComponent } from '../../components/edit-wallet-recharge/edit-wallet-recharge.component';

export const WALLET_RECHARGE_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Record Recharge',
      message:
        'Raise a wallet recharge. Balance updates after Payment Sheet payment.',
    },
    dynamicComponent: AddWalletRechargeComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Recharge',
      message: 'Correct this wallet recharge.',
    },
    dynamicComponent: EditWalletRechargeComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteWalletRechargeComponent,
  },
};
