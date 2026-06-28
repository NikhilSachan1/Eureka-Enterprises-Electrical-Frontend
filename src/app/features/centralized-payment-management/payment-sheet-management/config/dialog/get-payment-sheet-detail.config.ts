import {
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
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
import { RejectPaymentSheetItemComponent } from '../../components/reject-payment-sheet-item/reject-payment-sheet-item.component';
import { SubmitPaymentSheetComponent } from '../../components/submit-payment-sheet/submit-payment-sheet.component';
import { EPaymentSheetWorkflowActionType } from '../../types/payment-sheet.enum';

export const PAYMENT_SHEET_DETAIL_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Add beneficiaries',
      icon: ICONS.COMMON.USERS,
      message:
        'Select outstanding expense or fuel beneficiaries to add to this payment sheet.',
      size: EDialogSize.EXTRA_LARGE,
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
  [EButtonActionType.REJECT]: {
    dialogConfig: {
      ...REJECT_CONFIRMATION_DIALOG_CONFIG,
      header: 'Reject beneficiary?',
      message:
        'This beneficiary will be rejected on the payment sheet. Add remarks explaining why it is being rejected.',
      labels: {
        actionWord: 'reject',
        singleLabel: 'Reject',
        bulkLabel: 'Reject Selected',
      },
    },
    dynamicComponent: RejectPaymentSheetItemComponent,
  },
  [EPaymentSheetWorkflowActionType.FORWARD_TO_HR]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Forward to HR?',
      icon: ICONS.ACTIONS.SEND,
      message:
        'This payment sheet will be forwarded to HR for review. You cannot edit beneficiaries after forwarding.',
      labels: {
        actionWord: 'forward to HR',
        singleLabel: 'Forward to HR',
        bulkLabel: 'Forward to HR',
      },
    },
    dynamicComponent: SubmitPaymentSheetComponent,
  },
  [EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Forward to Admin?',
      icon: ICONS.ACTIONS.SEND,
      message:
        'This payment sheet will be forwarded to Admin for review. You cannot edit beneficiaries after forwarding.',
      labels: {
        actionWord: 'forward to Admin',
        singleLabel: 'Forward to Admin',
        bulkLabel: 'Forward to Admin',
      },
    },
    dynamicComponent: SubmitPaymentSheetComponent,
  },
  [EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Forward to Accountant?',
      icon: ICONS.ACTIONS.SEND,
      message:
        'This payment sheet will be forwarded to Accountant for processing. You cannot edit beneficiaries after forwarding.',
      labels: {
        actionWord: 'forward to Accountant',
        singleLabel: 'Forward to Accountant',
        bulkLabel: 'Forward to Accountant',
      },
    },
    dynamicComponent: SubmitPaymentSheetComponent,
  },
};
