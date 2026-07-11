import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import { IDeletePaymentSheetResponseDto } from '../../types/payment-sheet.dto';

@Component({
  selector: 'app-delete-payment-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-payment-sheet.component.html',
  styleUrl: './delete-payment-sheet.component.scss',
})
export class DeletePaymentSheetComponent
  extends FormBase<Record<string, never>>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly paymentSheetId = input.required<string>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    if (!this.paymentSheetId()) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Payment sheet id is required to delete sheet but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const paymentSheetId = this.paymentSheetId();

    if (!paymentSheetId) {
      return;
    }

    this.executeDeletePaymentSheetAction(paymentSheetId);
  }

  private executeDeletePaymentSheetAction(paymentSheetId: string): void {
    this.loadingService.show({
      title: 'Deleting payment sheet',
      message:
        "We're deleting this payment sheet. This will just take a moment.",
    });

    this.paymentSheetService
      .deletePaymentSheet(paymentSheetId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeletePaymentSheetResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete payment sheet', error);
          this.notificationService.error('Failed to delete payment sheet.');
        },
      });
  }
}
