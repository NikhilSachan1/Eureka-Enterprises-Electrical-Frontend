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
import { finalize, Observable } from 'rxjs';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IForwardPaymentSheetResponseDto,
  ISubmitPaymentSheetResponseDto,
} from '../../types/payment-sheet.dto';
import { EPaymentSheetWorkflowActionType } from '../../types/payment-sheet.enum';

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
  protected readonly workflowActionType =
    input.required<EPaymentSheetWorkflowActionType>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    if (!this.paymentSheetId()) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Payment sheet id is required for workflow action but was not provided'
      );
    }
  }

  onDialogAccept(): void {
    const paymentSheetId = this.paymentSheetId();

    if (!paymentSheetId) {
      return;
    }

    this.executeWorkflowAction(paymentSheetId);
  }

  private executeWorkflowAction(paymentSheetId: string): void {
    switch (this.workflowActionType()) {
      case EPaymentSheetWorkflowActionType.FORWARD_TO_HR:
        this.runWorkflowAction({
          loadingTitle: 'Forwarding to HR',
          loadingMessage:
            "We're forwarding this payment sheet to HR. This will just take a moment.",
          errorMessage: 'Failed to forward payment sheet to HR.',
          request$: this.paymentSheetService.submitPaymentSheet(paymentSheetId),
        });
        return;
      case EPaymentSheetWorkflowActionType.FORWARD_TO_ADMIN:
        this.runWorkflowAction({
          loadingTitle: 'Forwarding to Admin',
          loadingMessage:
            "We're forwarding this payment sheet to Admin. This will just take a moment.",
          errorMessage: 'Failed to forward payment sheet to Admin.',
          request$:
            this.paymentSheetService.forwardPaymentSheet(paymentSheetId),
        });
        return;
      case EPaymentSheetWorkflowActionType.FORWARD_TO_ACCOUNTANT:
        this.runWorkflowAction({
          loadingTitle: 'Forwarding to Accountant',
          loadingMessage:
            "We're forwarding this payment sheet to Accountant. This will just take a moment.",
          errorMessage: 'Failed to forward payment sheet to Accountant.',
          request$:
            this.paymentSheetService.forwardPaymentSheet(paymentSheetId),
        });
        return;
      default:
        this.logger.error(
          `Unknown payment sheet workflow action type: ${this.workflowActionType()}`
        );
        this.notificationService.error(
          FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
        );
    }
  }

  private runWorkflowAction(options: {
    loadingTitle: string;
    loadingMessage: string;
    errorMessage: string;
    request$: Observable<
      ISubmitPaymentSheetResponseDto | IForwardPaymentSheetResponseDto
    >;
  }): void {
    this.loadingService.show({
      title: options.loadingTitle,
      message: options.loadingMessage,
    });

    options.request$
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (
          response:
            | ISubmitPaymentSheetResponseDto
            | IForwardPaymentSheetResponseDto
        ) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error(options.errorMessage, error);
          this.notificationService.error(options.errorMessage);
        },
      });
  }
}
