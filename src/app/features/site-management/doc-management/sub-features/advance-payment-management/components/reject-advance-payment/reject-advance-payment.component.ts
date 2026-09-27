import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { AdvancePaymentService } from '../../services/advance-payment.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IAdvancePaymentGetBaseResponseDto,
  IRejectAdvancePaymentFormDto,
  IRejectAdvancePaymentResponseDto,
} from '../../types/advance-payment.dto';
import { REJECT_ACTION_ADVANCE_PAYMENT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-advance-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-advance-payment.component.html',
  styleUrl: './reject-advance-payment.component.scss',
})
export class RejectAdvancePaymentComponent
  extends FormBase<IRejectAdvancePaymentFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly advancePaymentService = inject(AdvancePaymentService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IAdvancePaymentGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject advance payment but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectAdvancePaymentFormDto>(
      REJECT_ACTION_ADVANCE_PAYMENT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const advancePaymentId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeAdvancePaymentRejectAction(formData, advancePaymentId);
  }

  private prepareFormData(): IRejectAdvancePaymentFormDto {
    return this.form.getData();
  }

  private executeAdvancePaymentRejectAction(
    formData: IRejectAdvancePaymentFormDto,
    advancePaymentId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting Advance Payment',
      message:
        "We're rejecting the advance payment. This will just take a moment.",
    });
    this.form.disable();

    this.advancePaymentService
      .rejectAdvancePayment(formData, advancePaymentId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectAdvancePaymentResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject advance payment', error);
          this.notificationService.error('Failed to reject advance payment.');
        },
      });
  }
}
