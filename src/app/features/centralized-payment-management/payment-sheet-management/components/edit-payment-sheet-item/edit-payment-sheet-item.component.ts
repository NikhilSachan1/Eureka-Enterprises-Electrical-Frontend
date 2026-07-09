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
import { createEditPaymentSheetItemFormConfig } from '../../config/form/edit-payment-sheet-item.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IUpdatePaymentSheetItemFormDto,
  IUpdatePaymentSheetItemResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheetDetailItemRow } from '../../types/payment-sheet-detail.interface';

@Component({
  selector: 'app-edit-payment-sheet-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-payment-sheet-item.component.html',
  styleUrl: './edit-payment-sheet-item.component.scss',
})
export class EditPaymentSheetItemComponent
  extends FormBase<IUpdatePaymentSheetItemFormDto>
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
    const item = rows?.[0];

    if (!item?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected payment sheet item is required to edit but was not provided'
      );
      return;
    }

    this.itemId = item.id;

    this.form = this.formService.createForm<IUpdatePaymentSheetItemFormDto>(
      createEditPaymentSheetItemFormConfig(item.payableAmount),
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          amount: item.payableAmount,
        },
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

    this.executeUpdatePaymentSheetItemAction(
      this.prepareFormData(),
      this.paymentSheetId(),
      this.itemId
    );
  }

  private prepareFormData(): IUpdatePaymentSheetItemFormDto {
    return this.form.getData();
  }

  private executeUpdatePaymentSheetItemAction(
    formData: IUpdatePaymentSheetItemFormDto,
    paymentSheetId: string,
    itemId: string
  ): void {
    this.loadingService.show({
      title: 'Updating payable amount',
      message:
        "We're updating the payable amount. This will just take a moment.",
    });
    this.form.disable();

    this.paymentSheetService
      .updatePaymentSheetItem(paymentSheetId, itemId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUpdatePaymentSheetItemResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to update payment sheet item', error);
          this.notificationService.error('Failed to update payable amount.');
        },
      });
  }
}
