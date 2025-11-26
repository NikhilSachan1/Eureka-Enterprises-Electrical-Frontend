import { Injectable, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import {
  IConfirmationDialogConfig,
  IConfirmationDialogRecordDetailConfig,
  IConfirmationDialogSettingConfig,
  IDialogActionConfig,
  EDialogType,
  EButtonActionType,
} from '@shared/types';
import { deepMerge } from '@shared/utility';
import {
  ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
  REGULARIZE_CONFIRMATION_DIALOG_CONFIG,
  WARNING_CONFIRMATION_DIALOG_CONFIG,
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
    [EDialogType.ALLOCATE]: ALLOCATE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.DEALLOCATE]: DEALLOCATE_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.WARNING]: WARNING_CONFIRMATION_DIALOG_CONFIG,
    [EDialogType.REGULARIZE]: REGULARIZE_CONFIRMATION_DIALOG_CONFIG,
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
    return deepMerge(
      defaultConfig,
      dialogSettingConfig
    ) as IConfirmationDialogSettingConfig;
  }

  createDialogConfig(
    actionType: EButtonActionType,
    actionConfigMap: Record<string, IDialogActionConfig>,
    recordDetail: IConfirmationDialogRecordDetailConfig,
    isBulk = false,
    showRecords = true,
    dynamicComponentInputs?: Record<string, unknown>
  ): IConfirmationDialogConfig {
    const config = actionConfigMap[actionType as string];

    if (!config) {
      throw new Error(
        `Unsupported action type: ${actionType}. Supported types are: ${Object.keys(actionConfigMap).join(', ')}`
      );
    }

    const acceptLabel = isBulk ? config.bulkLabel : config.singleLabel;
    const header = `${acceptLabel} ${recordDetail.title ?? 'Record'}`;
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
