import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  PLAIN_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { DeleteDocComponent } from '../../components/delete-doc/delete-doc.component';
import { PoDocComponent } from '../../components/po-doc/po-doc.component';
import { JmcDocComponent } from '../../components/jmc-doc/jmc-doc.component';
import { PaymentDocComponent } from '../../components/payment-doc/payment-doc.component';
import { InvoiceDocComponent } from '../../components/invoice-doc/invoice-doc.component';
import { ReportDocComponent } from '../../components/report-doc/report-doc.component';
import { PaymentAdviceDocComponent } from '../../components/payment-advice-doc/payment-advice-doc.component';
import { BankTransferDocComponent } from '../../components/bank-transfer-doc/bank-transfer-doc.component';
import { GstPaymentReleaseDocComponent } from '@features/site-management/doc-management/components/gst-payment-release-doc/gst-payment-release-doc.component';
import { EDocType } from '../../types/doc.enum';

export const DOC_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteDocComponent,
  },
};

export const DOC_ADD_BUTTON_CONFIG_MAP: Record<EDocType, IDialogActionConfig> =
  {
    [EDocType.PO]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Add PO',
        message: 'Fill and submit the PO details.',
      },
      dynamicComponent: PoDocComponent,
    },
    [EDocType.JMC]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Add JMC',
        message: 'Fill and submit the JMC details.',
      },
      dynamicComponent: JmcDocComponent,
    },
    [EDocType.REPORT]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Add Report',
        message: 'Fill and submit the report details.',
      },
      dynamicComponent: ReportDocComponent,
    },
    [EDocType.INVOICE]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Add Invoice',
        message: 'Fill and submit the invoice details.',
      },
      dynamicComponent: InvoiceDocComponent,
    },
    [EDocType.PAYMENT]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Book Payment',
        message:
          'Book this payment against the invoice (bank transfer and payment advice come next).',
      },
      dynamicComponent: PaymentDocComponent,
    },
    [EDocType.PAYMENT_ADVICE]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Add Payment Advice',
        message: 'Fill and submit the payment advice details.',
      },
      dynamicComponent: PaymentAdviceDocComponent,
    },
    [EDocType.BANK_TRANSFER]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'Add Bank Transfer',
        message: 'Enter the UTR and bank transfer details.',
      },
      dynamicComponent: BankTransferDocComponent,
    },
    [EDocType.GST_PAYMENT_RELEASE]: {
      dialogConfig: {
        ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
        header: 'GST payment release',
        message:
          'Record held GST to release: amount is a plain figure (no extra GST on it). Add date, remark, and attachments.',
      },
      dynamicComponent: GstPaymentReleaseDocComponent,
    },
  };
