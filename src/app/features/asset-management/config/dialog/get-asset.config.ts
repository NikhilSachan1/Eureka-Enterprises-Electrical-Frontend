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
      header: 'Handover Asset',
      message: 'Are you sure you want to handover this asset?',
    },
  },
  [EButtonActionType.HANDOVER_ACCEPTED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Accept Allocation',
      message: 'Are you sure you want to accept this allocation?',
    },
  },
  [EButtonActionType.HANDOVER_REJECTED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Reject Allocation',
      message: 'Are you sure you want to reject this allocation?',
    },
  },
  [EButtonActionType.HANDOVER_CANCELLED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Cancel Allocation',
      message: 'Are you sure you want to cancel this allocation?',
    },
  },
  [EButtonActionType.DEALLOCATE]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Deallocate Asset',
      message: 'Are you sure you want to deallocate this asset?',
    },
  },
};
