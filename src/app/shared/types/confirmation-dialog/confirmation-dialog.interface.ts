import { EDialogPosition, IDataViewDetailsWithEntity } from '@shared/types';
import { IButtonConfig } from '@shared/types/button/button.interface';
import { Type } from '@angular/core';

export interface IDialogConfig {
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
  labels?: {
    actionWord?: string;
    singleLabel?: string;
    bulkLabel?: string;
  };
}

export interface IDialogActionHandler {
  onDialogAccept?: () => void | Promise<void>;
  onDialogReject?: () => void | Promise<void>;
}

export interface IDialogActionConfig {
  dialogConfig: Partial<IDialogConfig>;
  recordDetails?: IDataViewDetailsWithEntity;
  dynamicComponent?: Type<unknown>;
  dynamicComponentInputs?: Record<string, unknown>;
}
