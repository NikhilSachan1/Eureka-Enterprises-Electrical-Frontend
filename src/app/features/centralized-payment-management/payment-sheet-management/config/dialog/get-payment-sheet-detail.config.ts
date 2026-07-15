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
import { PayPaymentSheetItemComponent } from '../../components/pay-payment-sheet-item/pay-payment-sheet-item.component';
import { RejectPaymentSheetItemComponent } from '../../components/reject-payment-sheet-item/reject-payment-sheet-item.component';
import { SubmitPaymentSheetComponent } from '../../components/submit-payment-sheet/submit-payment-sheet.component';
import { UnverifyPaymentSheetItemsComponent } from '../../components/unverify-payment-sheet-items/unverify-payment-sheet-items.component';
import { VerifyPaymentSheetItemsComponent } from '../../components/verify-payment-sheet-items/verify-payment-sheet-items.component';
import { DownloadPaymentSheetPdfComponent } from '../../components/download-payment-sheet-pdf/download-payment-sheet-pdf.component';
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
        'Select outstanding expense, fuel, or vendor beneficiaries to add to this payment sheet.',
      size: EDialogSize.EXTRA_LARGE,
      labels: {
        actionWord: 'add',
        singleLabel: 'Add Beneficiaries',
        bulkLabel: 'Add Beneficiaries',
      },
    },
    dynamicComponent: AddPaymentSheetItemsComponent,
  },
  [EButtonActionType.DOWNLOAD]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Download payment sheet PDF',
      icon: ICONS.COMMON.DOWNLOAD,
      message: 'Select the payment source you want to download as PDF.',
      labels: {
        actionWord: 'download',
        singleLabel: 'Download',
        bulkLabel: 'Download',
      },
    },
    dynamicComponent: DownloadPaymentSheetPdfComponent,
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
  [EButtonActionType.APPROVE]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Verify beneficiary?',
      icon: ICONS.FLEET.PUC,
      message:
        'This beneficiary will be marked as verified on the payment sheet.',
      labels: {
        actionWord: 'verify',
        singleLabel: 'Verify',
        bulkLabel: 'Verify Selected',
      },
    },
    dynamicComponent: VerifyPaymentSheetItemsComponent,
  },
  [EButtonActionType.UNVERIFY]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Unverify beneficiary?',
      icon: ICONS.COMMON.SYNC,
      message:
        'This beneficiary will be marked as unverified on the payment sheet.',
      labels: {
        actionWord: 'unverify',
        singleLabel: 'Unverify',
        bulkLabel: 'Unverify Selected',
      },
    },
    dynamicComponent: UnverifyPaymentSheetItemsComponent,
  },
  [EButtonActionType.PAID]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Record payment?',
      icon: ICONS.PAYMENT.RECORD,
      message:
        'Record payment for this beneficiary. Enter payment mode, paid date, and transaction reference.',
      labels: {
        actionWord: 'pay',
        singleLabel: 'Record Payment',
        bulkLabel: 'Record Payment',
      },
    },
    dynamicComponent: PayPaymentSheetItemComponent,
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
