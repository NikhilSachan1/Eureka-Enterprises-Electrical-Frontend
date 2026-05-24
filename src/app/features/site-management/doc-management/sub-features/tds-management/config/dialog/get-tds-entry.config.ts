import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { AddTdsPaymentReleaseComponent } from '../../components/add-tds-payment-release/add-tds-payment-release.component';
import { VerifyTdsEntryComponent } from '../../components/verify-tds-entry/verify-tds-entry.component';
import { RevertTdsEntryComponent } from '../../components/revert-tds-entry/revert-tds-entry.component';

export const TDS_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.PAID]: {
    dialogConfig: {
      header: 'Release TDS payment?',
      message: 'Record TDS payment release for the selected register entries?',
      labels: {
        actionWord: 'release payment for',
        singleLabel: 'Release Payment',
        bulkLabel: 'Release Payment',
      },
    },
    dynamicComponent: AddTdsPaymentReleaseComponent,
  },

  [EButtonActionType.APPROVE]: {
    dialogConfig: {
      ...APPROVE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Approve TDS entry?',
      message: 'Mark this register entry as verified for TDS filing?',
    },
    dynamicComponent: VerifyTdsEntryComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: {
      ...REJECT_CONFIRMATION_DIALOG_CONFIG,
      header: 'Revert verification?',
      message:
        'Set this entry back to pending verification? You can approve it again later.',
    },
    dynamicComponent: RevertTdsEntryComponent,
  },
};
