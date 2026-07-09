import {
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { ICONS } from '@shared/constants';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DownloadPaymentSheetPdfComponent } from '../../components/download-payment-sheet-pdf/download-payment-sheet-pdf.component';
import { RejectPaymentSheetComponent } from '../../components/reject-payment-sheet/reject-payment-sheet.component';
import { ReturnPaymentSheetComponent } from '../../components/return-payment-sheet/return-payment-sheet.component';

export const PAYMENT_SHEET_LIST_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
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
  [EButtonActionType.CANCEL]: {
    dialogConfig: {
      ...CANCEL_CONFIRMATION_DIALOG_CONFIG,
      header: 'Return payment sheet?',
      icon: ICONS.COMMON.ARROW_LEFT,
      message:
        'This payment sheet will be returned to draft. Beneficiaries can be edited again after returning.',
      labels: {
        actionWord: 'return to draft',
        singleLabel: 'Return Sheet',
        bulkLabel: 'Return Sheet',
      },
    },
    dynamicComponent: ReturnPaymentSheetComponent,
  },
  [EButtonActionType.REJECT]: {
    dialogConfig: {
      ...REJECT_CONFIRMATION_DIALOG_CONFIG,
      header: 'Reject payment sheet?',
      message:
        'This payment sheet will be rejected. Add remarks explaining why it is being rejected.',
      labels: {
        actionWord: 'reject',
        singleLabel: 'Reject Sheet',
        bulkLabel: 'Reject Sheet',
      },
    },
    dynamicComponent: RejectPaymentSheetComponent,
  },
};
