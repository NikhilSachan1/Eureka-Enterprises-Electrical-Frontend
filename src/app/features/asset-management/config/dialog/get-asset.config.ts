import {
  EButtonActionType,
  EButtonSeverity,
  EDialogSize,
  IDialogActionConfig,
} from '@shared/types';
import {
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { ICONS } from '@shared/constants';
import { DeleteAssetComponent } from '@features/asset-management/components/delete-asset/delete-asset.component';
import { ActionAssetComponent } from '@features/asset-management/components/action-asset/action-asset.component';
import { QrCodeAssetComponent } from '@features/asset-management/components/qr-code-asset/qr-code-asset.component';
import { ExportAssetComponent } from '@features/asset-management/components/export-asset/export-asset.component';
import { MarkLostAssetComponent } from '@features/asset-management/components/mark-lost-asset/mark-lost-asset.component';
import { MarkRecoveredAssetComponent } from '@features/asset-management/components/mark-recovered-asset/mark-recovered-asset.component';
import { IAssetGetBaseResponseDto } from '@features/asset-management/types/asset.dto';
import { isReturnPending } from '../table/get-asset.config';

export const ASSET_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteAssetComponent,
  },
  [EButtonActionType.DOWNLOAD]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Export asset report?',
      message: 'Generate a PDF report for the selected asset(s)?',
      icon: ICONS.COMMON.DOWNLOAD,
      labels: {
        actionWord: 'export',
        singleLabel: 'Export',
        bulkLabel: 'Export Selected',
      },
      acceptButtonProps: {
        label: 'Export',
        id: EButtonActionType.SUBMIT,
        icon: ICONS.COMMON.DOWNLOAD,
        severity: EButtonSeverity.PRIMARY,
      },
    },
    dynamicComponent: ExportAssetComponent,
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
  [EButtonActionType.RETURN_TO_OFFICE]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Return asset to office',
      message:
        'Send a return request to the office? The asset stays with you until the office accepts it.',
      icon: ICONS.SITE.BUILDING,
    },
  },
  [EButtonActionType.DEALLOCATE]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Deallocate asset',
      message: 'Remove this asset from the current assignee and free it up?',
    },
  },
  [EButtonActionType.MARK_LOST]: {
    dynamicComponent: MarkLostAssetComponent,
    dialogConfig: {
      header: 'Mark asset as lost',
      message:
        'The asset is taken off its assignee and marked lost. Record what happened below.',
      icon: ICONS.COMMON.EXCLAMATION_TRIANGLE,
      acceptButtonProps: {
        label: 'Mark as lost',
        icon: ICONS.COMMON.EXCLAMATION_TRIANGLE,
        severity: EButtonSeverity.DANGER,
      },
    },
  },
  [EButtonActionType.MARK_RECOVERED]: {
    dynamicComponent: MarkRecoveredAssetComponent,
    dialogConfig: {
      header: 'Mark asset as recovered',
      message: 'The asset becomes available again. Add how it was found.',
      icon: ICONS.ACTIONS.CHECK_CIRCLE,
      acceptButtonProps: {
        label: 'Mark as recovered',
        icon: ICONS.ACTIONS.CHECK_CIRCLE,
        severity: EButtonSeverity.SUCCESS,
      },
    },
  },
  [EButtonActionType.RETIRED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Retire asset',
      message:
        'The asset is permanently taken out of service. This cannot be undone.',
      icon: ICONS.COMMON.EXCLAMATION_TRIANGLE,
      acceptButtonProps: {
        label: 'Retire asset',
        icon: ICONS.ACTIONS.TIMES,
        severity: EButtonSeverity.DANGER,
      },
    },
  },
  [EButtonActionType.QR_CODE]: {
    dynamicComponent: QrCodeAssetComponent,
    dialogConfig: {
      header: 'Download QR Code',
      message:
        'Scan this QR code for asset verification, or download it to print/share.',
      icon: ICONS.COMMON.QRCODE,
      acceptButtonProps: {
        label: 'Download',
        icon: ICONS.COMMON.DOWNLOAD,
        severity: EButtonSeverity.PRIMARY,
      },
      rejectButtonProps: {
        label: 'Close',
        icon: ICONS.ACTIONS.TIMES,
        severity: EButtonSeverity.SECONDARY,
      },
    },
  },
};

/** Accept, reject and cancel are shared with handover; these texts are used when the pending request is a return. */
const ASSET_RETURN_ACTION_CONFIG_MAP: Partial<
  Record<EButtonActionType, IDialogActionConfig>
> = {
  [EButtonActionType.HANDOVER_ACCEPTED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Accept return',
      message:
        'Confirm the asset has been received at the office? It will become available again.',
    },
  },
  [EButtonActionType.HANDOVER_REJECTED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Reject return',
      message:
        'Reject this return request? The asset stays with the current holder.',
    },
  },
  [EButtonActionType.HANDOVER_CANCELLED]: {
    dynamicComponent: ActionAssetComponent,
    dialogConfig: {
      header: 'Cancel return',
      message: 'Cancel this return request? The asset will stay with you.',
    },
  },
};

export function getAssetActionDialogConfig(
  actionType: EButtonActionType,
  row: IAssetGetBaseResponseDto | undefined
): IDialogActionConfig {
  const returnConfig = ASSET_RETURN_ACTION_CONFIG_MAP[actionType];
  if (returnConfig && row && isReturnPending(row)) {
    return returnConfig;
  }
  return ASSET_ACTION_CONFIG_MAP[actionType];
}

export function getAssetQrDialogActionConfig(
  isBulk: boolean,
  selectedCount: number
): IDialogActionConfig {
  const base = ASSET_ACTION_CONFIG_MAP[EButtonActionType.QR_CODE];
  if (!isBulk) {
    return base;
  }

  const assetLabel = selectedCount === 1 ? 'asset' : 'assets';
  return {
    ...base,
    dialogConfig: {
      ...base.dialogConfig,
      header: 'Print QR Codes',
      message: `Print QR labels for ${selectedCount} selected ${assetLabel} in one sheet.`,
      size: EDialogSize.LARGE,
      acceptButtonProps: {
        label: 'Print',
        icon: ICONS.COMMON.PRINT,
        severity: EButtonSeverity.PRIMARY,
      },
    },
  };
}
