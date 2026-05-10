import { Injectable, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import {
  EButtonActionType,
  EDialogSize,
  IDialogActionConfig,
  IDialogConfig,
} from '@shared/types';
import { StatusUtil, deepMerge } from '@shared/utility';
import { CONFIRMATION_DIALOG_CONFIG } from '@shared/config';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly confirmationService = inject(ConfirmationService);

  readonly dialogState = signal<IDialogActionConfig>({} as IDialogActionConfig);
  private closeDialogCallback?: () => void;

  showConfirmationDialog(
    actionType: EButtonActionType,
    config: IDialogActionConfig,
    recordDetail: IDialogActionConfig['recordDetails'] | null,
    isBulk = false,
    showRecords = !isBulk,
    dynamicComponentInputs?: IDialogActionConfig['dynamicComponentInputs']
  ): void {
    const dialogConfig = this.createDialogConfig(
      actionType,
      config,
      recordDetail,
      isBulk,
      showRecords,
      dynamicComponentInputs
    );

    this.dialogState.set(dialogConfig);
    this.confirmationService.confirm(
      ConfirmationDialogService.toPrimeConfirmOptions(dialogConfig.dialogConfig)
    );
  }

  closeDialog(): void {
    if (this.closeDialogCallback) {
      this.closeDialogCallback();
    }
  }

  setCloseCallback(callback: () => void): void {
    this.closeDialogCallback = callback;
  }

  createDialogConfig(
    actionType: EButtonActionType,
    config: IDialogActionConfig,
    recordDetail: IDialogActionConfig['recordDetails'] | null,
    isBulk = false,
    showRecords = !isBulk,
    dynamicComponentInputs?: IDialogActionConfig['dynamicComponentInputs']
  ): IDialogActionConfig {
    // Get labels from dialogConfig
    const {
      labels,
      header: configHeader,
      message: configMessage,
    } = config.dialogConfig ?? {};

    // Get action word and labels
    const actionWord = labels?.actionWord ?? 'process';
    const acceptLabel = isBulk ? labels?.bulkLabel : labels?.singleLabel;

    // Generate header and message
    const header = acceptLabel ? `${acceptLabel} Record` : configHeader;
    const recordType = isBulk ? 'the selected records' : 'this record';
    const message =
      configMessage ?? `Are you sure you want to ${actionWord} ${recordType}?`;

    const colorClass = StatusUtil.getColorClass(actionType);

    // Merge icon and colors into dialogConfig (allow config to override)
    const icon =
      config.dialogConfig?.icon ?? StatusUtil.getIcon(actionType) ?? undefined;
    const iconContainerClass =
      config.dialogConfig?.iconContainerClass ??
      `${colorClass.bg} ${colorClass.border} ${colorClass.text}`;

    // Merge header/message into dialogConfig
    const processedDialogConfig: Partial<IDialogConfig> = {
      ...config.dialogConfig,
      header: configHeader ?? header,
      message,
      icon,
      iconContainerClass,
    };

    // Deep merge with default config
    const fullDialogConfig = deepMerge(
      CONFIRMATION_DIALOG_CONFIG,
      processedDialogConfig
    ) as IDialogConfig;

    const { size: resolvedSize = EDialogSize.MEDIUM, ...dialogWithoutSize } =
      fullDialogConfig;
    const styleClass =
      ConfirmationDialogService.mergeConfirmationPanelStyleClass(
        dialogWithoutSize.styleClass,
        resolvedSize
      );

    return {
      ...config,
      dialogConfig: { ...dialogWithoutSize, styleClass },
      recordDetails: showRecords ? (recordDetail ?? undefined) : undefined,
      dynamicComponentInputs,
    };
  }

  /** PrimeNG `confirm()` must not receive our custom `size` field. */
  private static toPrimeConfirmOptions(
    config: Partial<IDialogConfig>
  ): Record<string, unknown> {
    const prime = { ...config } as Partial<IDialogConfig> & {
      size?: EDialogSize;
    };
    delete prime.size;
    return prime as Record<string, unknown>;
  }

  private static mergeConfirmationPanelStyleClass(
    styleClass: string | undefined,
    size: EDialogSize
  ): string {
    const tokens = (styleClass ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .filter(t => !/^confirmation-dialog-panel--(sm|md|lg)$/.test(t));
    if (!tokens.includes('confirmation-dialog-panel')) {
      tokens.unshift('confirmation-dialog-panel');
    }
    tokens.push(`confirmation-dialog-panel--${size}`);
    return tokens.join(' ');
  }
}
