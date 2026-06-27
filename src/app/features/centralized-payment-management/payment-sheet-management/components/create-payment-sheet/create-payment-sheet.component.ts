import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import {
  ConfirmationDialogService,
  RouterNavigationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { CREATE_PAYMENT_SHEET_FORM_CONFIG } from '../../config/form/create-payment-sheet.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  ICreatePaymentSheetFormDto,
  ICreatePaymentSheetResponseDto,
  ICreatePaymentSheetUIFormDto,
} from '../../types/payment-sheet.dto';
import { buildPaymentSheetItemsFromOutstanding } from '../../utils/build-payment-sheet-items.util';

@Component({
  selector: 'app-create-payment-sheet',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './create-payment-sheet.component.html',
  styleUrl: './create-payment-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePaymentSheetComponent
  extends FormBase<ICreatePaymentSheetUIFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected readonly selectedExpenseRecords = input<
    IExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly selectedFuelRecords = input<
    IFuelExpenseOutstandingGetBaseResponseDto[]
  >([]);

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

    this.form = this.formService.createForm<ICreatePaymentSheetUIFormDto>(
      CREATE_PAYMENT_SHEET_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
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
    const title = this.form.getData().title?.trim();

    return {
      title: title ?? null,
      items: buildPaymentSheetItemsFromOutstanding(expenseRecords, fuelRecords),
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
          this.confirmationDialogService.closeDialog();
          void this.routerNavigationService.navigateToRoute([
            ROUTE_BASE_PATHS.PAYMENT_HUB,
            ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
          ]);
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
