import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';

@Component({
  selector: 'app-notification-alert-action',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class NotificationAlertActionComponent implements IDialogActionHandler {
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  readonly onView = input.required<() => void>();

  onDialogAccept(): void {
    this.onView()();
    this.confirmationDialogService.closeDialog();
  }

  onDialogReject(): void {
    this.confirmationDialogService.closeDialog();
  }
}
