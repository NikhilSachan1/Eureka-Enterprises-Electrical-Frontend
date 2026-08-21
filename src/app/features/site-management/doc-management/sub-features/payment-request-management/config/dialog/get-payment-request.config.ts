import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { AddPaymentRequestComponent } from '../../components/add-payment-request/add-payment-request.component';
import { EditPaymentRequestComponent } from '../../components/edit-payment-request/edit-payment-request.component';
import { DeletePaymentRequestComponent } from '../../components/delete-payment-request/delete-payment-request.component';
import { ApprovePaymentRequestComponent } from '../../components/approve-payment-request/approve-payment-request.component';
import { RejectPaymentRequestComponent } from '../../components/reject-payment-request/reject-payment-request.component';

export const PAYMENT_REQUEST_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Raise Payment Request',
      message: 'Raise a payment request against an invoice.',
    },
    dynamicComponent: AddPaymentRequestComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Payment Request',
      message: 'Update payment request details.',
    },
    dynamicComponent: EditPaymentRequestComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeletePaymentRequestComponent,
  },

  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovePaymentRequestComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: RejectPaymentRequestComponent,
  },
};
