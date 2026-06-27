import {
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EDialogSize,
  IDialogActionConfig,
} from '@shared/types';
import { AddPaymentSheetItemsComponent } from '../../components/add-payment-sheet-items/add-payment-sheet-items.component';
import { DeletePaymentSheetItemComponent } from '../../components/delete-payment-sheet-item/delete-payment-sheet-item.component';
import { EditPaymentSheetItemComponent } from '../../components/edit-payment-sheet-item/edit-payment-sheet-item.component';
import { SubmitPaymentSheetComponent } from '../../components/submit-payment-sheet/submit-payment-sheet.component';

export const PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.SUBMIT]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Forward to HR?',
      icon: ICONS.ACTIONS.SEND,
      message:
        'This payment sheet will be forwarded to HR for processing. You cannot edit beneficiaries after forwarding.',
      labels: {
        actionWord: 'forward to HR',
        singleLabel: 'Forward to HR',
        bulkLabel: 'Forward to HR',
      },
    },
    dynamicComponent: SubmitPaymentSheetComponent,
  },
  [EButtonActionType.ADD]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Add beneficiaries',
      icon: ICONS.COMMON.USERS,
      message:
        'Select outstanding expense or fuel beneficiaries to add to this payment sheet.',
      size: EDialogSize.LARGE,
      labels: {
        actionWord: 'add',
        singleLabel: 'Add Beneficiaries',
        bulkLabel: 'Add Beneficiaries',
      },
    },
    dynamicComponent: AddPaymentSheetItemsComponent,
  },
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
