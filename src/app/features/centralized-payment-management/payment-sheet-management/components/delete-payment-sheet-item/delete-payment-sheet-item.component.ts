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
import { DELETE_PAYMENT_SHEET_ITEM_FORM_CONFIG } from '../../config/form/delete-payment-sheet-item.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IDeletePaymentSheetItemFormDto,
  IDeletePaymentSheetItemResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

@Component({
  selector: 'app-delete-payment-sheet-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './delete-payment-sheet-item.component.html',
  styleUrl: './delete-payment-sheet-item.component.scss',
})
export class DeletePaymentSheetItemComponent
  extends FormBase<IDeletePaymentSheetItemFormDto>
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
        'Selected payment sheet item is required to delete but was not provided'
      );
      return;
    }

    this.itemId = rows[0].id;

    this.form = this.formService.createForm<IDeletePaymentSheetItemFormDto>(
      DELETE_PAYMENT_SHEET_ITEM_FORM_CONFIG,
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

    this.executeDeletePaymentSheetItemAction(
      this.prepareFormData(),
      this.paymentSheetId(),
      this.itemId
    );
  }

  private prepareFormData(): IDeletePaymentSheetItemFormDto {
    return this.form.getData();
  }

  private executeDeletePaymentSheetItemAction(
    formData: IDeletePaymentSheetItemFormDto,
    paymentSheetId: string,
    itemId: string
  ): void {
    this.loadingService.show({
      title: 'Removing beneficiary',
      message:
        "We're removing this beneficiary from the payment sheet. This will just take a moment.",
    });
    this.form.disable();

    this.paymentSheetService
      .deletePaymentSheetItem(paymentSheetId, itemId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeletePaymentSheetItemResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to remove payment sheet item', error);
          this.notificationService.error(
            'Failed to remove beneficiary from payment sheet.'
          );
        },
      });
  }
}
