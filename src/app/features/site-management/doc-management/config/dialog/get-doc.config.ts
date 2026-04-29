import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteDocComponent } from '../../components/delete-doc/delete-doc.component';
import { PoDocComponent } from '../../components/po-doc/po-doc.component';
import { JmcDocComponent } from '../../components/jmc-doc/jmc-doc.component';
import { PaymentDocComponent } from '../../components/payment-doc/payment-doc.component';
import { InvoiceDocComponent } from '../../components/invoice-doc/invoice-doc.component';
import { ReportDocComponent } from '../../components/report-doc/report-doc.component';
import { PaymentAdviceDocComponent } from '../../components/payment-advice-doc/payment-advice-doc.component';
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
        header: 'Add PO',
        message: 'Fill and submit the PO details.',
      },
      dynamicComponent: PoDocComponent,
    },
    [EDocType.JMC]: {
      dialogConfig: {
        header: 'Add JMC',
        message: 'Fill and submit the JMC details.',
      },
      dynamicComponent: JmcDocComponent,
    },
    [EDocType.REPORT]: {
      dialogConfig: {
        header: 'Add Report',
        message: 'Fill and submit the report details.',
      },
      dynamicComponent: ReportDocComponent,
    },
    [EDocType.INVOICE]: {
      dialogConfig: {
        header: 'Add Invoice',
        message: 'Fill and submit the invoice details.',
      },
      dynamicComponent: InvoiceDocComponent,
    },
    [EDocType.PAYMENT]: {
      dialogConfig: {
        header: 'Add Payment',
        message: 'Fill and submit the payment details.',
      },
      dynamicComponent: PaymentDocComponent,
    },
    [EDocType.PAYMENT_ADVICE]: {
      dialogConfig: {
        header: 'Add Payment Advice',
        message: 'Fill and submit the payment advice details.',
      },
      dynamicComponent: PaymentAdviceDocComponent,
    },
  };
