import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { ApprovePoComponent } from '../../components/approve-po/approve-po.component';
import { RejectPoComponent } from '../../components/reject-po/reject-po.component';
import { DeletePoComponent } from '../../components/delete-po/delete-po.component';
import { UnlockRequestPoComponent } from '../../components/unlock-request-po/unlock-request-po.component';
import { UnlockGrantPoComponent } from '../../components/unlock-grant-po/unlock-grant-po.component';
import { UnlockRequestRejectPoComponent } from '../../components/unlock-request-reject-po/unlock-request-reject-po.component';

export const PO_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovePoComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: RejectPoComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeletePoComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST]: {
    dialogConfig: {
      header: 'Unlock request PO',
      message: 'Unlock this PO and request access to the user?',
    },
    dynamicComponent: UnlockRequestPoComponent,
  },

  [EButtonActionType.UNLOCK_GRANT]: {
    dialogConfig: {
      header: 'Unlock grant PO',
      message: 'Unlock this PO and grant access to the user?',
    },
    dynamicComponent: UnlockGrantPoComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST_REJECT]: {
    dialogConfig: {
      header: 'Reject unlock request',
      message:
        'Reject this unlock request? The PO will stay locked for the requester.',
    },
    dynamicComponent: UnlockRequestRejectPoComponent,
  },
};
