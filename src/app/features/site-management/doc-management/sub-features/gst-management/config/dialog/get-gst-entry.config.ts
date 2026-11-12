import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { AddGstPaymentReleaseComponent } from '../../components/add-gst-payment-release/add-gst-payment-release.component';
import { VerifyGstEntryComponent } from '../../components/verify-gst-entry/verify-gst-entry.component';
import { RevertGstEntryComponent } from '../../components/revert-gst-entry/revert-gst-entry.component';

const SETTLE_CONFIG: Record<EDocContext, IDialogActionConfig> = {
  [EDocContext.PURCHASE]: {
    dialogConfig: {
      header: 'Book GST release to vendor?',
      message:
        'The vendor’s invoice is reflected in GSTR-2B. A GST book payment will be created for the held GST — pay it from the payment sheet or bank transfer.',
      labels: {
        actionWord: 'book the GST release for',
        singleLabel: 'Book GST Release',
        bulkLabel: 'Book GST Release',
      },
    },
    dynamicComponent: AddGstPaymentReleaseComponent,
  },
  [EDocContext.SALES]: {
    dialogConfig: {
      header: 'Mark held GST as received?',
      message:
        'Record the GST the client had held back and has now paid to us. It is saved as a GST bank transfer.',
      labels: {
        actionWord: 'mark held GST received for',
        singleLabel: 'Mark Received',
        bulkLabel: 'Mark Received',
      },
    },
    dynamicComponent: AddGstPaymentReleaseComponent,
  },
};

const VERIFY_CONFIG: Record<EDocContext, IDialogActionConfig> = {
  [EDocContext.PURCHASE]: {
    dialogConfig: {
      ...APPROVE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Verify in GSTR-2B?',
      message:
        'Confirm this vendor invoice appears in our GSTR-2B, so the input tax credit is available.',
    },
    dynamicComponent: VerifyGstEntryComponent,
  },
  [EDocContext.SALES]: {
    dialogConfig: {
      ...APPROVE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Verify in GSTR-1?',
      message:
        'Confirm this invoice is reported in our filed GSTR-1, so the client can claim the credit.',
    },
    dynamicComponent: VerifyGstEntryComponent,
  },
};

const REVERT_CONFIG: IDialogActionConfig = {
  dialogConfig: {
    ...REJECT_CONFIRMATION_DIALOG_CONFIG,
    header: 'Revert verification?',
    message:
      'Set this entry back to pending portal verification? You can verify it again later.',
  },
  dynamicComponent: RevertGstEntryComponent,
};

/** Dialog for a GST register action, worded for the side (vendor vs client) of the entry. */
export function getGstActionConfig(
  actionType: string,
  partyType: EDocContext
): IDialogActionConfig | undefined {
  switch (actionType) {
    case EButtonActionType.PAID:
      return SETTLE_CONFIG[partyType];
    case EButtonActionType.APPROVE:
      return VERIFY_CONFIG[partyType];
    case EButtonActionType.REJECT:
      return REVERT_CONFIG;
    default:
      return undefined;
  }
}
