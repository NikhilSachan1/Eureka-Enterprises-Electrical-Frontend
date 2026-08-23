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
  IApprovePaymentRequestFormDto,
  IApprovePaymentRequestResponseDto,
  IPaymentRequestGetBaseResponseDto,
} from '../../types/payment-request.dto';
import { createApprovePaymentRequestFormConfig } from '../../config/form/approve-payment-request.config';
import { parsePaymentRequestAmount } from '../../utils/payment-request-table-row.util';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approve-payment-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approve-payment-request.component.html',
  styleUrl: './approve-payment-request.component.scss',
})
export class ApprovePaymentRequestComponent
  extends FormBase<IApprovePaymentRequestFormDto>
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
        'Selected record is required to approve payment request but was not provided'
      );
      return;
    }

    const requestedAmount = parsePaymentRequestAmount(record[0].requestedAmount);
    if (requestedAmount === null || requestedAmount < 0.01) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Requested amount is required to approve payment request but was invalid'
      );
      return;
    }

    this.form = this.formService.createForm<IApprovePaymentRequestFormDto>(
      createApprovePaymentRequestFormConfig(requestedAmount),
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          approvedAmount: requestedAmount,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const paymentRequestId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executePaymentRequestApprovalAction(formData, paymentRequestId);
  }

  private prepareFormData(): IApprovePaymentRequestFormDto {
    return this.form.getData();
  }

  private executePaymentRequestApprovalAction(
    formData: IApprovePaymentRequestFormDto,
    paymentRequestId: string
  ): void {
    this.loadingService.show({
      title: 'Approving Payment Request',
      message:
        "We're approving the payment request. This will just take a moment.",
    });
    this.form.disable();

    this.paymentRequestService
      .approvePaymentRequest(formData, paymentRequestId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IApprovePaymentRequestResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve payment request', error);
          this.notificationService.error(
            'Failed to approve payment request.'
          );
        },
      });
  }
}
