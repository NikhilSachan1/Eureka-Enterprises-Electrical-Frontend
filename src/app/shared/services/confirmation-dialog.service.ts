import { inject, Injectable } from '@angular/core';
import {
  CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
} from '../config/confirmation-dialog.config';
import { IConfirmationDialogConfig } from '../models/confirmation-dialog.model';
import { EDialogType } from '../types/confirmation-dialog.types';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  private readonly defaultConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    CONFIRMATION_DIALOG_CONFIG;
  private readonly defaultDeleteConfirmationDialogConfig: Partial<IConfirmationDialogConfig> =
    DELETE_CONFIRMATION_DIALOG_CONFIG;
  private readonly confirmationService = inject(ConfirmationService);

  getConfirmationDialogConfig(
    dialogType: EDialogType = EDialogType.DEFAULT,
    options?: Partial<IConfirmationDialogConfig>,
  ): IConfirmationDialogConfig {
    const defaultConfig = this.getDialogDefaultConfigByDialogType(dialogType);
    return {
      ...defaultConfig,
      ...options,
    } as IConfirmationDialogConfig;
  }

  getDialogDefaultConfigByDialogType(
    dialogType: EDialogType,
  ): Partial<IConfirmationDialogConfig> {
    switch (dialogType) {
      case EDialogType.DELETE:
        return this.defaultDeleteConfirmationDialogConfig;
      default:
        return this.defaultConfirmationDialogConfig;
    }
  }

  showDialog(
    dialogType: EDialogType = EDialogType.DEFAULT,
    onAccept?: () => void,
    onReject?: () => void,
    options?: Partial<IConfirmationDialogConfig>,
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

    // Show dialog with config
    const config = this.getConfirmationDialogConfig(dialogType, {
      ...options,
      accept: acceptCallback,
      reject: rejectCallback,
    });

    this.confirmationService.confirm(config);
  }
}
