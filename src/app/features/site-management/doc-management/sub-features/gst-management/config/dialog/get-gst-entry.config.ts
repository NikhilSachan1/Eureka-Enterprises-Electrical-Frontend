import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { AddGstPaymentReleaseComponent } from '../../components/add-gst-payment-release/add-gst-payment-release.component';
import { VerifyGstEntryComponent } from '../../components/verify-gst-entry/verify-gst-entry.component';
import { RevertGstEntryComponent } from '../../components/revert-gst-entry/revert-gst-entry.component';

export const GST_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'GST Payment Release',
      message: 'Record GST payment release against a vendor.',
    },
    dynamicComponent: AddGstPaymentReleaseComponent,
  },

  [EButtonActionType.APPROVE]: {
    dialogConfig: {
      ...APPROVE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Approve GST entry?',
      message: 'Mark this register entry as verified for GST filing?',
    },
    dynamicComponent: VerifyGstEntryComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: {
      ...REJECT_CONFIRMATION_DIALOG_CONFIG,
      header: 'Reject verification?',
      message:
        'Set this entry back to pending verification? You can approve it again later.',
    },
    dynamicComponent: RevertGstEntryComponent,
  },
};
