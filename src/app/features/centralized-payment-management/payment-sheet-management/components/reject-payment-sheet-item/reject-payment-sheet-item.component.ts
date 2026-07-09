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
import { REJECT_PAYMENT_SHEET_ITEM_FORM_CONFIG } from '../../config/form/reject-payment-sheet-item.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IRejectPaymentSheetItemFormDto,
  IRejectPaymentSheetItemResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

@Component({
  selector: 'app-reject-payment-sheet-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-payment-sheet-item.component.html',
  styleUrl: './reject-payment-sheet-item.component.scss',
})
export class RejectPaymentSheetItemComponent
  extends FormBase<IRejectPaymentSheetItemFormDto>
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

  private itemId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();

    if (!rows?.length || !rows[0]?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected payment sheet item is required to reject but was not provided'
      );
      return;
    }

    this.itemId = rows[0].id;

    this.form = this.formService.createForm<IRejectPaymentSheetItemFormDto>(
      REJECT_PAYMENT_SHEET_ITEM_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    if (!this.itemId) {
      return;
    }

    this.executeRejectPaymentSheetItemAction(
      this.prepareFormData(),
      this.paymentSheetId(),
      this.itemId
    );
  }

  private prepareFormData(): IRejectPaymentSheetItemFormDto {
    return this.form.getData();
  }

  private executeRejectPaymentSheetItemAction(
    formData: IRejectPaymentSheetItemFormDto,
    paymentSheetId: string,
    itemId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting beneficiary',
      message:
        "We're rejecting this beneficiary on the payment sheet. This will just take a moment.",
    });
    this.form.disable();

    this.paymentSheetService
      .rejectPaymentSheetItem(paymentSheetId, itemId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectPaymentSheetItemResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject payment sheet item', error);
          this.notificationService.error(
            'Failed to reject beneficiary on payment sheet.'
          );
        },
      });
  }
}
