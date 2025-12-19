import { EDialogPosition, IDataViewDetailsWithEmployee } from '@shared/types';
import { IButtonConfig } from '@shared/types/button/button.interface';
import { Type } from '@angular/core';

export interface IConfirmationDialogSettingConfig {
  header: string;
  icon: string;
  iconBackgroundColor?: string;
  iconTextColor?: string;
  iconContainerClass?: string;
  message: string;
  closeOnEscape: boolean;
  dismissableMask: boolean;
  closable: boolean;
  position: EDialogPosition;
  blockScroll: boolean;
  styleClass: string;
  acceptButtonProps: Partial<IButtonConfig>;
  rejectButtonProps: Partial<IButtonConfig>;
}

export interface IDialogActionHandler {
  onDialogAccept?: () => void | Promise<void>;
  onDialogReject?: () => void | Promise<void>;
}

export interface IConfirmationDialogConfig {
  dialogSettingConfig?: Partial<IConfirmationDialogSettingConfig>;
  recordDetails?: IDataViewDetailsWithEmployee;
  dynamicComponent?: Type<unknown>;
  dynamicComponentInputs?: Record<string, unknown>;
}

export interface IDialogActionConfig {
  actionWord: string;
  singleLabel: string;
  bulkLabel: string;
  dynamicComponent?: Type<unknown>;
}
