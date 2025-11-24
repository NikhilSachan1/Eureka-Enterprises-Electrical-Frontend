import {
  EConfirmationDialogRecordDetailInputType,
  EDialogPosition,
} from '@shared/types';
import { IButtonConfig } from '@shared/models/button.model';
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

export interface IConfirmationDialogRecordDetailConfig {
  title?: string;
  details: {
    label: string;
    value: string | number | Date;
    type?: EConfirmationDialogRecordDetailInputType;
  }[];
}

export interface IDialogActionHandler {
  onDialogAccept?: () => void | Promise<void>;
  onDialogReject?: () => void | Promise<void>;
}

export interface IConfirmationDialogConfig {
  dialogSettingConfig?: Partial<IConfirmationDialogSettingConfig>;
  recordDetails?: IConfirmationDialogRecordDetailConfig;
  dynamicComponent?: Type<unknown>;
  dynamicComponentInputs?: Record<string, unknown>;
}

export interface IDialogActionConfig {
  actionWord: string;
  singleLabel: string;
  bulkLabel: string;
  dynamicComponent?: Type<unknown>;
}
