import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteAssetComponent } from '@features/asset-management/components/delete-asset/delete-asset.component';
import { ActionAssetComponent } from '@features/asset-management/components/action-asset/action-asset.component';

export const ASSET_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteAssetComponent,
  },
  [EButtonActionType.HANDOVER_INITIATE]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Start asset handover',
      message:
        'Begin the handover process for this asset? Add any notes below.',
    },
  },
  [EButtonActionType.HANDOVER_ACCEPTED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Accept handover',
      message: 'Accept this handover and take responsibility for this asset?',
    },
  },
  [EButtonActionType.HANDOVER_REJECTED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Reject handover',
      message: 'Reject this handover request?',
    },
  },
  [EButtonActionType.HANDOVER_CANCELLED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Cancel handover',
      message:
        'Cancel this handover? The asset will stay with the current holder.',
    },
  },
  [EButtonActionType.DEALLOCATE]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Deallocate asset',
      message: 'Remove this asset from the current assignee and free it up?',
    },
  },
};
