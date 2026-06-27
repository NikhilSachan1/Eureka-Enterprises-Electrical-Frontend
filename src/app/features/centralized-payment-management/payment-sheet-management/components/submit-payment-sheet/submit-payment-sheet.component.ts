import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import { ISubmitPaymentSheetResponseDto } from '../../types/payment-sheet.dto';

@Component({
  selector: 'app-submit-payment-sheet',
  imports: [],
  templateUrl: './submit-payment-sheet.component.html',
  styleUrl: './submit-payment-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmitPaymentSheetComponent
  implements OnInit, IDialogActionHandler
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly paymentSheetId = input.required<string>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    if (!this.paymentSheetId()) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Payment sheet id is required to submit but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    const paymentSheetId = this.paymentSheetId();

    if (!paymentSheetId) {
      return;
    }

    this.executeSubmitPaymentSheetAction(paymentSheetId);
  }

  private executeSubmitPaymentSheetAction(paymentSheetId: string): void {
    this.loadingService.show({
      title: 'Forwarding to HR',
      message:
        "We're forwarding this payment sheet to HR. This will just take a moment.",
    });

    this.paymentSheetService
      .submitPaymentSheet(paymentSheetId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISubmitPaymentSheetResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to forward payment sheet to HR', error);
          this.notificationService.error(
            'Failed to forward payment sheet to HR.'
          );
        },
      });
  }
}
