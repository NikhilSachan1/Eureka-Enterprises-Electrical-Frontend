import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';

export interface IConfirmationDialogConfig {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  acceptButtonProps?: {
    label?: string;
    icon?: string;
    outlined?: boolean;
    size?: string;
  };
  rejectButtonProps?: {
    label?: string;
    icon?: string;
    outlined?: boolean;
    size?: string;
  };
  accept?: () => void;
  reject?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationDialogService {
  constructor(private confirmationService: ConfirmationService) {}

  confirm(config: IConfirmationDialogConfig): Observable<boolean> {
    const result = new Subject<boolean>();

    this.confirmationService.confirm({
      message: config.message,
      header: config.header || 'Confirmation',
      icon: config.icon || 'pi pi-exclamation-triangle',
      acceptLabel: config.acceptLabel || 'Yes',
      rejectLabel: config.rejectLabel || 'No',
      acceptButtonStyleClass: config.acceptButtonStyleClass || 'p-button-danger',
      rejectButtonStyleClass: config.rejectButtonStyleClass || 'p-button-secondary',
      acceptButtonProps: config.acceptButtonProps,
      rejectButtonProps: config.rejectButtonProps,
      accept: () => {
        result.next(true);
        result.complete();
      },
      reject: () => {
        result.next(false);
        result.complete();
      }
    });

    return result.asObservable();
  }
} 