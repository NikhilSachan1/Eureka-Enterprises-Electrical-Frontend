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
import { RETURN_PAYMENT_SHEET_FORM_CONFIG } from '../../config/form/return-payment-sheet.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IReturnPaymentSheetFormDto,
  IReturnPaymentSheetResponseDto,
} from '../../types/payment-sheet.dto';

@Component({
  selector: 'app-return-payment-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './return-payment-sheet.component.html',
  styleUrl: './return-payment-sheet.component.scss',
})
export class ReturnPaymentSheetComponent
  extends FormBase<IReturnPaymentSheetFormDto>
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
        'Payment sheet id is required to return sheet but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IReturnPaymentSheetFormDto>(
      RETURN_PAYMENT_SHEET_FORM_CONFIG,
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

    this.executeReturnPaymentSheetAction(
      this.prepareFormData(),
      paymentSheetId
    );
  }

  private prepareFormData(): IReturnPaymentSheetFormDto {
    return this.form.getData();
  }

  private executeReturnPaymentSheetAction(
    formData: IReturnPaymentSheetFormDto,
    paymentSheetId: string
  ): void {
    this.loadingService.show({
      title: 'Returning payment sheet',
      message:
        "We're returning this payment sheet to draft. This will just take a moment.",
    });
    this.form.disable();

    this.paymentSheetService
      .returnPaymentSheet(paymentSheetId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IReturnPaymentSheetResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to return payment sheet to draft', error);
          this.notificationService.error(
            'Failed to return payment sheet to draft.'
          );
        },
      });
  }
}
