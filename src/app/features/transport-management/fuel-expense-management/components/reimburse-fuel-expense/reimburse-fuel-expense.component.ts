import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { AppConfigurationService } from '@shared/services/app-configuration/app-configuration.service';
import { IPaymentRecordModeState } from '@features/centralized-payment-management/payment-sheet-management/types/payment-sheet.interface';
import { bindPaymentRecordMode } from '@features/centralized-payment-management/payment-sheet-management/utils/payment-record-mode.util';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { REIMBURSE_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import {
  IFuelExpenseReimburseFormDto,
  IFuelExpenseReimburseResponseDto,
} from '../../types/fuel-expense.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EPaymentRecordMode } from '@features/centralized-payment-management/payment-sheet-management/types/payment-sheet.enum';
import { DEFAULT_PAYMENT_RECORD_MODE } from '@features/centralized-payment-management/payment-sheet-management/config/form/payment-record-mode.config';
import { DirectPaymentWarningComponent } from '@features/centralized-payment-management/shared/components/direct-payment-warning/direct-payment-warning.component';

@Component({
  selector: 'app-reimburse-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    DirectPaymentWarningComponent,
  ],
  templateUrl: './reimburse-fuel-expense.component.html',
  styleUrl: './reimburse-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReimburseFuelExpenseComponent
  extends FormBase<IFuelExpenseReimburseFormDto>
  implements OnInit
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly route = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly injector = inject(Injector);
  protected recordMode?: IPaymentRecordModeState;

  ngOnInit(): void {
    this.form = this.formService.createForm<IFuelExpenseReimburseFormDto>(
      REIMBURSE_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: { recordMode: DEFAULT_PAYMENT_RECORD_MODE },
      }
    );
    this.recordMode = bindPaymentRecordMode({
      formGroup: this.form.formGroup,
      configuredModes: this.appConfigurationService.paymentRecordModes,
      currentValue: this.formService.trackFieldChanges(
        this.form.formGroup,
        'recordMode',
        this.destroyRef
      ),
      injector: this.injector,
    });

    this.applyPrefillFromQueryParams();
  }

  /** Direct (chosen or set by config) — the template warns that no payment sheet will be created. */
  protected isDirectEntry(): boolean {
    return this.recordMode?.current() === EPaymentRecordMode.DIRECT;
  }

  private applyPrefillFromQueryParams(): void {
    const map = this.route.snapshot.queryParamMap;
    const employeeName = map.get('employeeName');
    const expenseAmountRaw = map.get('expenseAmount');
    const expenseDate = new Date();

    const formData: Partial<IFuelExpenseReimburseFormDto> = {
      employeeName: employeeName ?? '',
      fuelAmount: expenseAmountRaw ? Number(expenseAmountRaw) : 0,
      fuelFillDate: expenseDate,
    };
    this.form.patch(formData);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeReimburseFuelExpense(formData);
  }

  private prepareFormData(): IFuelExpenseReimburseFormDto {
    const formData = this.form.getData();
    // A hidden dropdown (config allows one mode) still sends that mode.
    return {
      ...formData,
      recordMode: this.recordMode?.current() ?? formData.recordMode,
    };
  }

  private executeReimburseFuelExpense(
    formData: IFuelExpenseReimburseFormDto
  ): void {
    this.loadingService.show({
      title: 'Reimburse Fuel Expense',
      message:
        "We're submitting this fuel expense reimbursement. This will just take a moment.",
    });
    this.form.disable();

    this.fuelExpenseService
      .reimburseFuelExpense(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IFuelExpenseReimburseResponseDto) => {
          this.notifyReimburseResult(response, formData.recordMode);
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error(
            'Failed to apply reimburse fuel expense'
          );
        },
      });
  }

  /** Payment always goes through; a missing sheet is a warning, not a failure (retrying would pay twice). */
  private notifyReimburseResult(
    response: IFuelExpenseReimburseResponseDto,
    recordMode: EPaymentRecordMode
  ): void {
    if (recordMode === EPaymentRecordMode.DIRECT) {
      this.notificationService.success(
        'Reimburse fuel expense applied successfully'
      );
      return;
    }
    const sheetNumber = response.paymentSheet?.sheetNumber;
    if (sheetNumber) {
      this.notificationService.success(
        `Fuel expense reimbursed. Payment sheet ${sheetNumber} created.`
      );
      return;
    }
    this.notificationService.warning(response.message);
  }

  protected onReset(): void {
    this.confirmResetSingleForm(() => {
      // Reset clears every field; Record Payment goes back to its default, not empty.
      this.onResetSingleForm({
        recordMode:
          this.recordMode?.defaultMode() ?? DEFAULT_PAYMENT_RECORD_MODE,
      });
    });
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Reimburse Fuel Expense',
      subtitle: 'Reimburse approved fuel expenses to employees',
    };
  }
}
