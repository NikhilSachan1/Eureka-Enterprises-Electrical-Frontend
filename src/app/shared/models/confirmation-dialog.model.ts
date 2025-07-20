import { FormGroup } from '@angular/forms';
import { Signal } from '@angular/core';
import {
  EConfirmationDialogRecordDetailInputType,
  EDialogPosition,
} from '@shared/types';
import { IButtonConfig } from '@shared/models/button.model';
import { IFormInputFieldsConfig } from '@shared/models/form.model';

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

export interface IConfirmationDialogConfig {
  dialogSettingConfig?: Partial<IConfirmationDialogSettingConfig>;
  inputFields?: IFormInputFieldsConfig;
  recordDetails?: IConfirmationDialogRecordDetailConfig;
  onAccept?: (formData?: Record<string, unknown>) => void;
  onReject?: (formData?: Record<string, unknown>) => void;
}

export interface IDialogState {
  formGroup: FormGroup | null;
  config: IConfirmationDialogConfig;
  onAccept?: (formData?: Record<string, unknown>) => void;
  onReject?: (formData?: Record<string, unknown>) => void;
}

export interface IEnhancedConfirmationDialog {
  config: Signal<IConfirmationDialogConfig>;
  formGroup: Signal<FormGroup | null>;
  isOpen: Signal<boolean>; // Signal indicating whether the dialog is currently visible/open
  isLoading: Signal<boolean>; // Signal indicating whether the dialog is in a loading state (e.g., during async operations)
  show: () => void; // Opens/displays the confirmation dialog
  hide: () => void; // Closes/hides the confirmation dialog
  setLoading: (loading: boolean) => void; // Sets the loading state of the dialog (shows/hides loading indicators)
  updateConfig: (
    config: Partial<IConfirmationDialogConfig>
  ) => IConfirmationDialogConfig; // Updates the dialog configuration dynamically and returns the updated config
}
