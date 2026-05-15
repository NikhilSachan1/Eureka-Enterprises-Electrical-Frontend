import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { ApproveJmcComponent } from '../../components/approve-jmc/approve-jmc.component';
import { RejectJmcComponent } from '../../components/reject-jmc/reject-jmc.component';
import { UnlockRequestJmcComponent } from '../../components/unlock-request-jmc/unlock-request-jmc.component';
import { UnlockGrantJmcComponent } from '../../components/unlock-grant-jmc/unlock-grant-jmc.component';
import { UnlockRequestRejectJmcComponent } from '../../components/unlock-request-reject-jmc/unlock-request-reject-jmc.component';
import { AddJmcComponent } from '../../components/add-jmc/add-jmc.component';
import { EditJmcComponent } from '../../components/edit-jmc/edit-jmc.component';
import { DeleteJmcComponent } from '../../components/delete-jmc/delete-jmc.component';

export const JMC_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Add JMC',
      message: 'Add a new JMC to the system.',
    },
    dynamicComponent: AddJmcComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit JMC',
      message: 'Update JMC details.',
    },
    dynamicComponent: EditJmcComponent,
  },

  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApproveJmcComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: RejectJmcComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteJmcComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST]: {
    dialogConfig: {
      header: 'Unlock request JMC',
      message: 'Unlock this JMC and request access to the user?',
    },
    dynamicComponent: UnlockRequestJmcComponent,
  },

  [EButtonActionType.UNLOCK_GRANT]: {
    dialogConfig: {
      header: 'Unlock grant JMC',
      message: 'Unlock this JMC and grant access to the user?',
    },
    dynamicComponent: UnlockGrantJmcComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST_REJECT]: {
    dialogConfig: {
      header: 'Reject unlock request',
      message:
        'Reject this unlock request? The JMC will stay locked for the requester.',
    },
    dynamicComponent: UnlockRequestRejectJmcComponent,
  },
};
