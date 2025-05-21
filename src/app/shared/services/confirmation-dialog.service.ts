import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';
import { CONFIRMATION_DIALOG_CONFIG } from '../config/confirmation-dialog.config';

export interface IConfirmationResult {
  confirmed: boolean;
  comment: string;
  message: string;
}

export interface IConfirmationParams {
  actionType: any;
  itemName?: string;
  isPlural?: boolean;
  customMessage?: string;
  customHeader?: string;
  // Optional overrides for default settings
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  // Default configuration that can be overridden
  private readonly defaultConfig: any = {
    position: 'center',
    closeOnEscape: true,
    dismissableMask: false,
    blockScroll: true,
    acceptVisible: true,
    rejectVisible: true,
    acceptIcon: 'pi pi-check',
    rejectIcon: 'pi pi-times',
    acceptButtonProps: {
      outlined: false,
      size: 'normal'
    },
    rejectButtonProps: {
      outlined: true,
      size: 'normal'
    }
  };

  constructor(private confirmationService: ConfirmationService) {}

  confirm(params: IConfirmationParams): Observable<IConfirmationResult> {
    const result = new Subject<IConfirmationResult>();
    const config = CONFIRMATION_DIALOG_CONFIG;
    
    // Create a copy of the config to avoid modifying the original
    const dialogConfig = {
      ...config,
    };

    // Override with custom message/header if provided
    if (params.customMessage) {
      dialogConfig.message = params.customMessage;
    }
    if (params.customHeader) {
      dialogConfig.header = params.customHeader;
    }

    // Merge default config with provided overrides
    const finalConfig = {
      ...this.defaultConfig,
      ...dialogConfig,
      // Override with any explicitly provided params
      position: params.position ?? this.defaultConfig.position,
      closeOnEscape: params.closeOnEscape ?? this.defaultConfig.closeOnEscape,
      dismissableMask: params.dismissableMask ?? this.defaultConfig.dismissableMask,
      blockScroll: params.blockScroll ?? this.defaultConfig.blockScroll,
      acceptVisible: params.acceptVisible ?? this.defaultConfig.acceptVisible,
      rejectVisible: params.rejectVisible ?? this.defaultConfig.rejectVisible
    };

    this.confirmationService.confirm({
      message: finalConfig.message,
      header: finalConfig.header,
      icon: finalConfig.icon,
      acceptLabel: finalConfig.acceptLabel,
      rejectLabel: finalConfig.rejectLabel,
      acceptButtonStyleClass: finalConfig.acceptButtonStyleClass,
      rejectButtonStyleClass: finalConfig.rejectButtonStyleClass,
      position: finalConfig.position,
      acceptIcon: finalConfig.acceptIcon,
      rejectIcon: finalConfig.rejectIcon,
      acceptVisible: finalConfig.acceptVisible,
      rejectVisible: finalConfig.rejectVisible,
      blockScroll: finalConfig.blockScroll,
      closeOnEscape: finalConfig.closeOnEscape,
      dismissableMask: finalConfig.dismissableMask,
      defaultFocus: finalConfig.defaultFocus,
      acceptButtonProps: finalConfig.acceptButtonProps,
      rejectButtonProps: finalConfig.rejectButtonProps,
      accept: () => {
        result.next({
          confirmed: true,
          comment: '',
          message: 'Action confirmed successfully'
        });
        result.complete();
      },
      reject: () => {
        result.next({
          confirmed: false,
          comment: '',
          message: 'Action cancelled'
        });
        result.complete();
      }
    });

    return result.asObservable();
  }
} 