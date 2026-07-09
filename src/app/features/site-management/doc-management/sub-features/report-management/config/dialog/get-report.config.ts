import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { AddReportComponent } from '../../components/add-report/add-report.component';
import { EditReportComponent } from '../../components/edit-report/edit-report.component';
import { DeleteReportComponent } from '../../components/delete-report/delete-report.component';
import { UnlockRequestReportComponent } from '../../components/unlock-request-report/unlock-request-report.component';
import { UnlockGrantReportComponent } from '../../components/unlock-grant-report/unlock-grant-report.component';
import { UnlockRequestRejectReportComponent } from '../../components/unlock-request-reject-report/unlock-request-reject-report.component';

export const REPORT_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Add Report',
      message: 'Add a new report to the system.',
    },
    dynamicComponent: AddReportComponent,
  },

  [EButtonActionType.EDIT]: {
    dialogConfig: {
      header: 'Edit Report',
      message: 'Update report details.',
    },
    dynamicComponent: EditReportComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteReportComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST]: {
    dialogConfig: {
      header: 'Unlock request Report',
      message: 'Unlock this Report and request access to the user?',
    },
    dynamicComponent: UnlockRequestReportComponent,
  },

  [EButtonActionType.UNLOCK_GRANT]: {
    dialogConfig: {
      header: 'Unlock grant Report',
      message: 'Unlock this Report and grant access to the user?',
    },
    dynamicComponent: UnlockGrantReportComponent,
  },

  [EButtonActionType.UNLOCK_REQUEST_REJECT]: {
    dialogConfig: {
      header: 'Reject unlock request',
      message:
        'Reject this unlock request? The Report will stay locked for the requester.',
    },
    dynamicComponent: UnlockRequestRejectReportComponent,
  },
};
