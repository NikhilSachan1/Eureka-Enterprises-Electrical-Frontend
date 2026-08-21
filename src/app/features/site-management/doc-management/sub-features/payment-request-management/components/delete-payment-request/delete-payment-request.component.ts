import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentRequestService } from '../../services/payment-request.service';
import {
  IDeletePaymentRequestResponseDto,
  IPaymentRequestGetBaseResponseDto,
} from '../../types/payment-request.dto';

@Component({
  selector: 'app-delete-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-payment-request.component.html',
  styleUrl: './delete-payment-request.component.scss',
})
export class DeletePaymentRequestComponent
  implements OnInit, IDialogActionHandler
{
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IPaymentRequestGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private paymentRequestId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete payment request but was not provided'
      );
      return;
    }
    this.paymentRequestId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.paymentRequestId) {
      return;
    }
    this.executePaymentRequestDeleteAction(this.paymentRequestId);
  }

  private executePaymentRequestDeleteAction(paymentRequestId: string): void {
    this.loadingService.show({
      title: 'Deleting payment request',
      message:
        "We're removing the payment request. This will just take a moment.",
    });

    this.paymentRequestService
      .deletePaymentRequest(paymentRequestId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeletePaymentRequestResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete payment request', error);
          this.notificationService.error('Failed to delete payment request.');
        },
      });
  }
}
