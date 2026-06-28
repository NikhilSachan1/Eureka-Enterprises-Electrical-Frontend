import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { REJECT_PAYMENT_SHEET_FORM_CONFIG } from '../../config/form/reject-payment-sheet.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IRejectPaymentSheetFormDto,
  IRejectPaymentSheetResponseDto,
} from '../../types/payment-sheet.dto';

@Component({
  selector: 'app-reject-payment-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-payment-sheet.component.html',
  styleUrl: './reject-payment-sheet.component.scss',
})
export class RejectPaymentSheetComponent
  extends FormBase<IRejectPaymentSheetFormDto>
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
        'Payment sheet id is required to reject sheet but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectPaymentSheetFormDto>(
      REJECT_PAYMENT_SHEET_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const paymentSheetId = this.paymentSheetId();

    if (!paymentSheetId) {
      return;
    }

    this.executeRejectPaymentSheetAction(
      this.prepareFormData(),
      paymentSheetId
    );
  }

  private prepareFormData(): IRejectPaymentSheetFormDto {
    return this.form.getData();
  }

  private executeRejectPaymentSheetAction(
    formData: IRejectPaymentSheetFormDto,
    paymentSheetId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting payment sheet',
      message:
        "We're rejecting this payment sheet. This will just take a moment.",
    });
    this.form.disable();

    this.paymentSheetService
      .rejectPaymentSheet(paymentSheetId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectPaymentSheetResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject payment sheet', error);
          this.notificationService.error('Failed to reject payment sheet.');
        },
      });
  }
}
