import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { AddBankTransferComponent } from '../../components/add-bank-transfer/add-bank-transfer.component';
import { EditBankTransferComponent } from '../../components/edit-bank-transfer/edit-bank-transfer.component';
import { DeleteBankTransferComponent } from '../../components/delete-bank-transfer/delete-bank-transfer.component';
import { SendEmailPaymentAdviceComponent } from '../../components/send-email-payment-advice/send-email-payment-advice.component';

export function getBankTransferActionConfigMap(
  docContext: EDocContext
): Record<string, IDialogActionConfig> {
  const isSales = docContext === EDocContext.SALES;

  return {
    [EButtonActionType.ADD]: {
      dialogConfig: {
        header: isSales ? 'Bank Received' : 'Bank Transfer',
        message: isSales
          ? 'Record a bank receipt against an invoice.'
          : 'Record a bank transfer against a book payment.',
      },
      dynamicComponent: AddBankTransferComponent,
    },

    [EButtonActionType.EDIT]: {
      dialogConfig: {
        header: isSales ? 'Edit Bank Received' : 'Edit Bank Transfer',
        message: isSales
          ? 'Update bank received details.'
          : 'Update bank transfer details.',
      },
      dynamicComponent: EditBankTransferComponent,
    },

    [EButtonActionType.DELETE]: {
      dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
      dynamicComponent: DeleteBankTransferComponent,
    },

    [EButtonActionType.SEND_EMAIL]: {
      dialogConfig: {
        header: 'Send Payment Advice',
        message: 'Send payment advice email.',
      },
      dynamicComponent: SendEmailPaymentAdviceComponent,
    },
  };
}
