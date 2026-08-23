import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { PaymentRequestService } from '../../services/payment-request.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IPaymentRequestGetBaseResponseDto,
  IRejectPaymentRequestFormDto,
  IRejectPaymentRequestResponseDto,
} from '../../types/payment-request.dto';
import { REJECT_ACTION_PAYMENT_REQUEST_FORM_CONFIG } from '../../config/form/reject-payment-request.config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-payment-request.component.html',
  styleUrl: './reject-payment-request.component.scss',
})
export class RejectPaymentRequestComponent
  extends FormBase<IRejectPaymentRequestFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IPaymentRequestGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject payment request but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectPaymentRequestFormDto>(
      REJECT_ACTION_PAYMENT_REQUEST_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const paymentRequestId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executePaymentRequestRejectAction(formData, paymentRequestId);
  }

  private prepareFormData(): IRejectPaymentRequestFormDto {
    return this.form.getData();
  }

  private executePaymentRequestRejectAction(
    formData: IRejectPaymentRequestFormDto,
    paymentRequestId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting Payment Request',
      message:
        "We're rejecting the payment request. This will just take a moment.",
    });
    this.form.disable();

    this.paymentRequestService
      .rejectPaymentRequest(formData, paymentRequestId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectPaymentRequestResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject payment request', error);
          this.notificationService.error(
            'Failed to reject payment request.'
          );
        },
      });
  }
}
