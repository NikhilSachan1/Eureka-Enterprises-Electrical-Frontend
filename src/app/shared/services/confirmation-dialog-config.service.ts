import { inject, Injectable } from '@angular/core';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '../config/confirmation-dialog.config';
import { IConfirmationDialogConfig } from '../models/confirmation-dialog.model';
import { EDialogType } from '../types/confirmation-dialog.types';
import { ConfirmationService } from 'primeng/api';
import { deepMerge } from '../utility/object.utils';
import { BehaviorSubject } from 'rxjs';
import { IInputFieldsConfig } from '../models/input-fields-config.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly defaultConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    CONFIRMATION_DIALOG_CONFIG;
  private readonly defaultDeleteConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    DELETE_CONFIRMATION_DIALOG_CONFIG;
  private readonly defaultApproveConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    APPROVE_CONFIRMATION_DIALOG_CONFIG;
  private readonly defaultRejectConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    REJECT_CONFIRMATION_DIALOG_CONFIG;
  private readonly defaultCancelConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    CANCEL_CONFIRMATION_DIALOG_CONFIG;
  private readonly confirmationService = inject(ConfirmationService);

  // Subject to emit input field configurations to components
  private inputFieldConfigsSubject = new BehaviorSubject<Partial<IInputFieldsConfig>[]>([]);
  public inputFieldConfigs$ = this.inputFieldConfigsSubject.asObservable();

  getConfirmationDialogConfig(
    dialogType: EDialogType = EDialogType.DEFAULT,
    options?: Partial<IConfirmationDialogConfig>,
  ): IConfirmationDialogConfig {
    const defaultConfig = this.getDialogDefaultConfigByDialogType(dialogType);
    return deepMerge(defaultConfig, options || {}) as IConfirmationDialogConfig;
  }

  getDialogDefaultConfigByDialogType(
    dialogType: EDialogType,
  ): Partial<IConfirmationDialogConfig> {
    switch (dialogType) {
      case EDialogType.DELETE:
        return this.defaultDeleteConfirmationDialogConfig;
      case EDialogType.APPROVE:
        return this.defaultApproveConfirmationDialogConfig;
      case EDialogType.REJECT:
        return this.defaultRejectConfirmationDialogConfig;
      case EDialogType.CANCEL:
        return this.defaultCancelConfirmationDialogConfig;
      default:
        return this.defaultConfirmationDialogConfig;
    }
  }

  showDialog(
    dialogType: EDialogType = EDialogType.DEFAULT,
    options?: Partial<IConfirmationDialogConfig>,
    onAccept?: () => void,
    onReject?: () => void,
  ): void {
    // Create accept callback
    const acceptCallback = onAccept 
      ? () => {
          try {
            onAccept();
          } catch (error) {
            console.error('Error in accept action:', error);
          }
        }
      : undefined;

    // Create reject callback
    const rejectCallback = onReject
      ? () => {
          try {
            onReject();
          } catch (error) {
            console.error('Error in reject action:', error);
          }
        }
      : undefined;

    // Get the final configuration
    const config = this.getConfirmationDialogConfig(dialogType, {
      ...options,
      accept: acceptCallback,
      reject: rejectCallback,
    });

    // If there are input field configurations, emit them to the component
    if (config.inputFieldConfigs?.length) {
      this.inputFieldConfigsSubject.next(config.inputFieldConfigs);
    } else {
      this.inputFieldConfigsSubject.next([]);
    }

    // Show dialog with config
    this.confirmationService.confirm(config);
  }
}
