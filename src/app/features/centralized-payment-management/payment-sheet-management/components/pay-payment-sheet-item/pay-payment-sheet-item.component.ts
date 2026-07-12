import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { toLocalCalendarDate } from '@shared/utility';
import { finalize } from 'rxjs';
import { PAY_PAYMENT_SHEET_ITEM_FORM_CONFIG } from '../../config/form/pay-payment-sheet-item.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IPayPaymentSheetItemFormDto,
  IPayPaymentSheetItemResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

@Component({
  selector: 'app-pay-payment-sheet-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './pay-payment-sheet-item.component.html',
  styleUrl: './pay-payment-sheet-item.component.scss',
})
export class PayPaymentSheetItemComponent
  extends FormBase<IPayPaymentSheetItemFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IPaymentSheetDetailItemRow[]>();
  protected readonly paymentSheetId = input.required<string>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly isVendorPayment = computed(() =>
    Boolean(this.selectedRecord()[0]?.bookPaymentId)
  );

  private itemId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();

    if (!rows?.length || !rows[0]?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected payment sheet item is required to pay but was not provided'
      );
      return;
    }

    this.itemId = rows[0].id;

    this.form = this.formService.createForm<IPayPaymentSheetItemFormDto>(
      PAY_PAYMENT_SHEET_ITEM_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          ...(this.isVendorPayment() ? {} : { paymentMode: 'neft/imps' }),
          paidDate: toLocalCalendarDate(new Date()) as Date,
        },
      }
    );

    if (this.isVendorPayment()) {
      const paymentModeControl = this.form.formGroup.get('paymentMode');
      paymentModeControl?.clearValidators();
      paymentModeControl?.updateValueAndValidity();

      const paidFromAccountControl = this.form.formGroup.get('paidFromAccount');
      paidFromAccountControl?.setValidators([Validators.required]);
      paidFromAccountControl?.updateValueAndValidity();
    }
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    if (!this.itemId) {
      return;
    }

    this.executePayPaymentSheetItemAction(
      this.prepareFormData(),
      this.paymentSheetId(),
      this.itemId
    );
  }

  private prepareFormData(): IPayPaymentSheetItemFormDto {
    const formData = this.form.getData();
    const bookPaymentId = this.selectedRecord()[0]?.bookPaymentId;

    if (!bookPaymentId) {
      return formData;
    }

    return {
      paidFromAccount: formData.paidFromAccount,
      paidDate: formData.paidDate,
      transactionId: formData.transactionId,
      bookPaymentId,
    };
  }

  private executePayPaymentSheetItemAction(
    formData: IPayPaymentSheetItemFormDto,
    paymentSheetId: string,
    itemId: string
  ): void {
    this.loadingService.show({
      title: 'Recording payment',
      message:
        "We're recording payment for this beneficiary. This will just take a moment.",
    });
    this.form.disable();

    this.paymentSheetService
      .payPaymentSheetItem(paymentSheetId, itemId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPayPaymentSheetItemResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to pay payment sheet item', error);
          this.notificationService.error(
            'Failed to record payment for beneficiary.'
          );
        },
      });
  }
}
