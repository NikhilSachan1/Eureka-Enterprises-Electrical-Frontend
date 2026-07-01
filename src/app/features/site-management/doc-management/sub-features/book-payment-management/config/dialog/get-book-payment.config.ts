import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { AddBookPaymentComponent } from '../../components/add-book-payment/add-book-payment.component';
import { EditBookPaymentComponent } from '../../components/edit-book-payment/edit-book-payment.component';
import { DeleteBookPaymentComponent } from '../../components/delete-book-payment/delete-book-payment.component';
import { ApproveBookPaymentComponent } from '../../components/approve-book-payment/approve-book-payment.component';
import { RejectBookPaymentComponent } from '../../components/reject-book-payment/reject-book-payment.component';
import { UnlockRequestBookPaymentComponent } from '../../components/unlock-request-book-payment/unlock-request-book-payment.component';
import { UnlockGrantBookPaymentComponent } from '../../components/unlock-grant-book-payment/unlock-grant-book-payment.component';
import { UnlockRequestRejectBookPaymentComponent } from '../../components/unlock-request-reject-book-payment/unlock-request-reject-book-payment.component';

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

  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApproveBookPaymentComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: RejectBookPaymentComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteBookPaymentComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST]: {
    dialogConfig: {
      header: 'Unlock request book payment',
      message: 'Unlock this book payment and request access to the user?',
    },
    dynamicComponent: UnlockRequestBookPaymentComponent,
  },

  [EButtonActionType.UNLOCK_GRANT]: {
    dialogConfig: {
      header: 'Unlock grant book payment',
      message: 'Unlock this book payment and grant access to the user?',
    },
    dynamicComponent: UnlockGrantBookPaymentComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST_REJECT]: {
    dialogConfig: {
      header: 'Reject unlock request',
      message:
        'Reject this unlock request? The book payment will stay locked for the requester.',
    },
    dynamicComponent: UnlockRequestRejectBookPaymentComponent,
  },
};
