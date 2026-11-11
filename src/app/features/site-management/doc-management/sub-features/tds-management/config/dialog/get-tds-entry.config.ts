import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { AddTdsPaymentReleaseComponent } from '../../components/add-tds-payment-release/add-tds-payment-release.component';
import { VerifyTdsEntryComponent } from '../../components/verify-tds-entry/verify-tds-entry.component';
import { RevertTdsEntryComponent } from '../../components/revert-tds-entry/revert-tds-entry.component';

const CHALLAN_CONFIG: IDialogActionConfig = {
  dialogConfig: {
    header: 'Record TDS challan?',
    message:
      'Record the challan with which the TDS deducted from these vendor payments was deposited with the government.',
    labels: {
      actionWord: 'record the TDS challan for',
      singleLabel: 'Record Challan',
      bulkLabel: 'Record Challan',
    },
  },
  dynamicComponent: AddTdsPaymentReleaseComponent,
};

const VERIFY_CONFIG: Record<EDocContext, IDialogActionConfig> = {
  [EDocContext.PURCHASE]: {
    dialogConfig: {
      ...APPROVE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Verify in 26Q?',
      message:
        'Confirm this deduction is reported in our filed 26Q return (and Form 16A is issued to the vendor).',
    },
    dynamicComponent: VerifyTdsEntryComponent,
  },
  [EDocContext.SALES]: {
    dialogConfig: {
      ...APPROVE_CONFIRMATION_DIALOG_CONFIG,
      header: 'Verify in Form 26AS?',
      message:
        'Confirm the TDS the client deducted is credited against our PAN in Form 26AS.',
    },
    dynamicComponent: VerifyTdsEntryComponent,
  },
};

const REVERT_CONFIG: IDialogActionConfig = {
  dialogConfig: {
    ...REJECT_CONFIRMATION_DIALOG_CONFIG,
    header: 'Revert verification?',
    message:
      'Set this entry back to pending verification? A recorded challan stays as it is.',
  },
  dynamicComponent: RevertTdsEntryComponent,
};

/** Dialog for a TDS register action, worded for the side (vendor vs client) of the entry. */
export function getTdsActionConfig(
  actionType: string,
  partyType: EDocContext
): IDialogActionConfig | undefined {
  switch (actionType) {
    case EButtonActionType.PAID:
      return CHALLAN_CONFIG;
    case EButtonActionType.APPROVE:
      return VERIFY_CONFIG[partyType];
    case EButtonActionType.REJECT:
      return REVERT_CONFIG;
    default:
      return undefined;
  }
}
