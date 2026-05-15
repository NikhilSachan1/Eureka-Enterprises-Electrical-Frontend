import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { ApproveInvoiceComponent } from '../../components/approve-invoice/approve-invoice.component';
import { RejectInvoiceComponent } from '../../components/reject-invoice/reject-invoice.component';
import { UnlockRequestInvoiceComponent } from '../../components/unlock-request-invoice/unlock-request-invoice.component';
import { UnlockGrantInvoiceComponent } from '../../components/unlock-grant-invoice/unlock-grant-invoice.component';
import { UnlockRequestRejectInvoiceComponent } from '../../components/unlock-request-reject-invoice/unlock-request-reject-invoice.component';
import { AddInvoiceComponent } from '../../components/add-invoice/add-invoice.component';
import { EditInvoiceComponent } from '../../components/edit-invoice/edit-invoice.component';
import { DeleteInvoiceComponent } from '../../components/delete-invoice/delete-invoice.component';

export const INVOICE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Add Invoice',
      message: 'Add a new invoice to the system.',
    },
    dynamicComponent: AddInvoiceComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Invoice',
      message: 'Update invoice details.',
    },
    dynamicComponent: EditInvoiceComponent,
  },

  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApproveInvoiceComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: RejectInvoiceComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteInvoiceComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST]: {
    dialogConfig: {
      header: 'Unlock request Invoice',
      message: 'Unlock this invoice and request access to the user?',
    },
    dynamicComponent: UnlockRequestInvoiceComponent,
  },

  [EButtonActionType.UNLOCK_GRANT]: {
    dialogConfig: {
      header: 'Unlock grant Invoice',
      message: 'Unlock this invoice and grant access to the user?',
    },
    dynamicComponent: UnlockGrantInvoiceComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST_REJECT]: {
    dialogConfig: {
      header: 'Reject unlock request',
      message:
        'Reject this unlock request? The invoice will stay locked for the requester.',
    },
    dynamicComponent: UnlockRequestRejectInvoiceComponent,
  },
};
