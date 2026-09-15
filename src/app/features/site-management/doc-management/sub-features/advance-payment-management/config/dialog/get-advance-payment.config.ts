import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { AddAdvancePaymentComponent } from '../../components/add-advance-payment/add-advance-payment.component';
import { EditAdvancePaymentComponent } from '../../components/edit-advance-payment/edit-advance-payment.component';
import { DeleteAdvancePaymentComponent } from '../../components/delete-advance-payment/delete-advance-payment.component';
import { ApproveAdvancePaymentComponent } from '../../components/approve-advance-payment/approve-advance-payment.component';
import { RejectAdvancePaymentComponent } from '../../components/reject-advance-payment/reject-advance-payment.component';

export const ADVANCE_PAYMENT_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Add Advance Payment',
      message: 'Record an advance payment against a vendor PO.',
    },
    dynamicComponent: AddAdvancePaymentComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Advance Payment',
      message: 'Update advance payment details.',
    },
    dynamicComponent: EditAdvancePaymentComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteAdvancePaymentComponent,
  },

  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApproveAdvancePaymentComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: RejectAdvancePaymentComponent,
  },
};
