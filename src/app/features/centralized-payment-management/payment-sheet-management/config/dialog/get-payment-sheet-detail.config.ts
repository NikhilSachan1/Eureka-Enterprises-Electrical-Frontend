import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DeletePaymentSheetItemComponent } from '../../components/delete-payment-sheet-item/delete-payment-sheet-item.component';
import { EditPaymentSheetItemComponent } from '../../components/edit-payment-sheet-item/edit-payment-sheet-item.component';

export const PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit payable amount',
      message: 'Update the payable amount for this beneficiary.',
    },
    dynamicComponent: EditPaymentSheetItemComponent,
  },
  [EButtonActionType.DELETE]: {
    dialogConfig: {
      ...DELETE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Remove beneficiary?',
      message:
        'This beneficiary will be removed from the payment sheet. You cannot undo this.',
      labels: {
        actionWord: 'remove',
        singleLabel: 'Remove',
        bulkLabel: 'Remove Selected',
      },
    },
    dynamicComponent: DeletePaymentSheetItemComponent,
  },
};
