import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  ICreatePaymentSheetFormDto,
  ICreatePaymentSheetResponseDto,
} from '../../types/payment-sheet.dto';
import {
  EPaymentSheetBeneficiaryType,
  EPaymentSheetSourceType,
} from '../../types/payment-sheet.enum';

@Component({
  selector: 'app-create-payment-sheet',
  imports: [],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePaymentSheetComponent
  extends FormBase<ICreatePaymentSheetFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedExpenseRecords = input<
    IExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly selectedFuelRecords = input<
    IFuelExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const expenseRecords = this.selectedExpenseRecords();
    const fuelRecords = this.selectedFuelRecords();

    if (!expenseRecords.length && !fuelRecords.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected outstanding records are required to create a payment sheet but were not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(
      this.selectedExpenseRecords(),
      this.selectedFuelRecords()
    );
    this.executeCreatePaymentSheetAction(formData);
  }

  private prepareFormData(
    expenseRecords: IExpenseOutstandingGetBaseResponseDto[],
    fuelRecords: IFuelExpenseOutstandingGetBaseResponseDto[]
  ): ICreatePaymentSheetFormDto {
    const expenseItems = expenseRecords.map(record => ({
      beneficiaryType: EPaymentSheetBeneficiaryType.USER,
      userId: record.userId,
      sourceType: EPaymentSheetSourceType.EXPENSE,
      requestedAmount: record.pendingAmount,
    }));

    const fuelItems = fuelRecords.map(record => ({
      beneficiaryType: EPaymentSheetBeneficiaryType.USER,
      userId: record.userId,
      sourceType: EPaymentSheetSourceType.FUEL_EXPENSE,
      requestedAmount: record.pendingAmount,
    }));

    return {
      items: [...expenseItems, ...fuelItems],
    };
  }

  private executeCreatePaymentSheetAction(
    formData: ICreatePaymentSheetFormDto
  ): void {
    this.loadingService.show({
      title: 'Creating payment sheet',
      message:
        "Please wait while we're creating the payment sheet. This will just take a moment.",
    });

    this.paymentSheetService
      .createPaymentSheet(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICreatePaymentSheetResponseDto) => {
          this.notificationService.success(
            response.message || 'Payment sheet created successfully.'
          );
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to create payment sheet', error);
          this.notificationService.error(
            'Could not create the payment sheet. Please try again.'
          );
        },
      });
  }
}
