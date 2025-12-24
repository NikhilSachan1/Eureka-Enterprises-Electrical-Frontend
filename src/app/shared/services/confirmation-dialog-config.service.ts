import { Injectable, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import {
  IConfirmationDialogConfig,
  IDataViewDetailsWithEmployee,
  IConfirmationDialogSettingConfig,
  IDialogActionConfig,
  EDialogType,
  EButtonActionType,
} from '@shared/types';
import { deepMerge, ColorUtil } from '@shared/utility';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
  REGULARIZE_CONFIRMATION_DIALOG_CONFIG,
  SEND_PASSWORD_LINK_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly confirmationService = inject(ConfirmationService);

  private readonly defaultConfigs: Record<
    EDialogType,
    Partial<IConfirmationDialogSettingConfig>
  > = {
    [EDialogType.DEFAULT]: CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.DELETE]: DELETE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.APPROVE]: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.REJECT]: REJECT_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.CANCEL]: CANCEL_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.REGULARIZE]: REGULARIZE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.SEND_PASSWORD_LINK]:
      SEND_PASSWORD_LINK_CONFIRMATION_DIALOG_CONFIG,
  };

  readonly dialogState = signal<IConfirmationDialogConfig>({});
  private closeDialogCallback?: () => void;

  showConfirmationDialog(
    dialogConfig: IConfirmationDialogConfig,
    dialogType: EDialogType
  ): void {
    const finalConfig = this.buildFinalDialogConfig(dialogType, dialogConfig);
    if (finalConfig) {
      this.dialogState.set({
        ...dialogConfig,
        dialogSettingConfig: finalConfig,
      });
      this.confirmationService.confirm(finalConfig);
    }
  }

  closeDialog(): void {
    if (this.closeDialogCallback) {
      this.closeDialogCallback();
    }
  }

  setCloseCallback(callback: () => void): void {
    this.closeDialogCallback = callback;
  }

  private buildFinalDialogConfig(
    dialogType: EDialogType,
    config?: IConfirmationDialogConfig
  ): IConfirmationDialogSettingConfig {
    const defaultConfig =
      this.defaultConfigs[dialogType] ||
      this.defaultConfigs[EDialogType.DEFAULT];
    const dialogSettingConfig = config?.dialogSettingConfig ?? {};

    const mergedConfig = deepMerge(
      defaultConfig,
      dialogSettingConfig
    ) as IConfirmationDialogSettingConfig;

    if (!dialogSettingConfig.iconContainerClass) {
      const colorClasses = ColorUtil.getColorClass(dialogType);
      mergedConfig.iconContainerClass = `${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}`;
    }

    return mergedConfig;
  }

  createDialogConfig(
    actionType: EButtonActionType,
    actionConfigMap: Record<string, IDialogActionConfig>,
    recordDetail: IDataViewDetailsWithEmployee,
    isBulk = false,
    showRecords = !isBulk,
    dynamicComponentInputs?: Record<string, unknown>
  ): IConfirmationDialogConfig {
    const config = actionConfigMap[actionType as string];

    if (!config) {
      throw new Error(
        `Unsupported action type: ${actionType}. Supported types are: ${Object.keys(actionConfigMap).join(', ')}`
      );
    }

    const acceptLabel = isBulk ? config.bulkLabel : config.singleLabel;
    const header = `${acceptLabel} Record`;
    const recordType = isBulk ? 'the selected records' : 'this record';
    const message = `Are you sure you want to ${config.actionWord} ${recordType}?`;

    return {
      dialogSettingConfig: {
        header,
        message,
      },
      recordDetails: showRecords ? recordDetail : undefined,
      dynamicComponent: config.dynamicComponent,
      dynamicComponentInputs,
    };
  }
}
