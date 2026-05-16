import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { AddBookPaymentComponent } from '../../components/add-book-payment/add-book-payment.component';
import { EditBookPaymentComponent } from '../../components/edit-book-payment/edit-book-payment.component';
import { DeleteBookPaymentComponent } from '../../components/delete-book-payment/delete-book-payment.component';

export const BOOK_PAYMENT_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Book Payment',
      message: 'Record a payment booking against an invoice.',
    },
    dynamicComponent: AddBookPaymentComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Book Payment',
      message: 'Update book payment details.',
    },
    dynamicComponent: EditBookPaymentComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteBookPaymentComponent,
  },
};
