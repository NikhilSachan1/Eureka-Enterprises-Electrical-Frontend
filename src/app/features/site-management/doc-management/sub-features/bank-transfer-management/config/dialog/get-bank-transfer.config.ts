import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { AddBankTransferComponent } from '../../components/add-bank-transfer/add-bank-transfer.component';
import { EditBankTransferComponent } from '../../components/edit-bank-transfer/edit-bank-transfer.component';
import { DeleteBankTransferComponent } from '../../components/delete-bank-transfer/delete-bank-transfer.component';

export const BANK_TRANSFER_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Bank Transfer',
      message:
        'Record a bank transfer against an invoice (sale) or a book payment (purchase).',
    },
    dynamicComponent: AddBankTransferComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Bank Transfer',
      message: 'Update bank transfer details.',
    },
    dynamicComponent: EditBankTransferComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteBankTransferComponent,
  },
};
