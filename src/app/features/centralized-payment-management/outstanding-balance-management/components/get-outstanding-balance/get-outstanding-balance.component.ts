import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { LoggerService } from '@core/services';
import { GetExpenseOutstandingComponent } from '@features/centralized-payment-management/expense-payment-management/components/get-expense-outstanding/get-expense-outstanding.component';
import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { GetFuelExpenseOutstandingComponent } from '@features/centralized-payment-management/fuel-expense-payment-management/components/get-fuel-expense-outstanding/get-fuel-expense-outstanding.component';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ICONS } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  EButtonSeverity,
  IPageHeaderConfig,
} from '@shared/types';
import { PAYMENT_SHEET_ACTION_CONFIG_MAP } from '@features/centralized-payment-management/payment-sheet-management/config';
import { GetVendorOutstandingComponent } from '@features/centralized-payment-management/vendor-payment-management/components/get-vendor-outstanding/get-vendor-outstanding.component';
import { IVendorBookPaymentTableRow } from '@features/centralized-payment-management/vendor-payment-management/types/vendor-outstanding.interface';

@Component({
  selector: 'app-get-outstanding-balance',
  imports: [
    PageHeaderComponent,
    GetExpenseOutstandingComponent,
    GetFuelExpenseOutstandingComponent,
    GetVendorOutstandingComponent,
  ],
  templateUrl: './get-outstanding-balance.component.html',
  styleUrl: './get-outstanding-balance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetOutstandingBalanceComponent {
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedExpenseRecords = signal<
    IExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly selectedFuelRecords = signal<
    IFuelExpenseOutstandingGetBaseResponseDto[]
  >([]);
  protected readonly selectedVendorBookPayments = signal<
    IVendorBookPaymentTableRow[]
  >([]);

  protected readonly totalSelectedCount = computed(
    () =>
      this.selectedExpenseRecords().length +
      this.selectedFuelRecords().length +
      this.selectedVendorBookPayments().length
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  protected onExpenseSelectionChange(
    records: IExpenseOutstandingGetBaseResponseDto[]
  ): void {
    this.selectedExpenseRecords.set(records);
  }

  protected onFuelSelectionChange(
    records: IFuelExpenseOutstandingGetBaseResponseDto[]
  ): void {
    this.selectedFuelRecords.set(records);
  }

  protected onVendorSelectionChange(
    records: IVendorBookPaymentTableRow[]
  ): void {
    this.selectedVendorBookPayments.set(records);
  }

  protected onHeaderButtonClick(actionType: string): void {
    if (actionType !== EButtonActionType.GENERATE) {
      return;
    }

    this.openCreatePaymentSheetDialog();
  }

  private openCreatePaymentSheetDialog(): void {
    const expenseRecords = this.selectedExpenseRecords();
    const fuelRecords = this.selectedFuelRecords();
    const vendorBookPayments = this.selectedVendorBookPayments();

    if (
      !expenseRecords.length &&
      !fuelRecords.length &&
      !vendorBookPayments.length
    ) {
      this.logger.logUserAction(
        'Create payment sheet blocked: no outstanding beneficiaries selected'
      );
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.GENERATE,
      PAYMENT_SHEET_ACTION_CONFIG_MAP[EButtonActionType.GENERATE],
      null,
      true,
      false,
      {
        selectedExpenseRecords: expenseRecords,
        selectedFuelRecords: fuelRecords,
        selectedVendorBookPayments: vendorBookPayments,
      }
    );
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const selectedCount = this.totalSelectedCount();

    return {
      title: 'Outstanding Balance',
      subtitle: 'View outstanding balance records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          id: EButtonActionType.GENERATE,
          actionName: EButtonActionType.GENERATE,
          label: 'Create Payment Sheet',
          icon: ICONS.COMMON.FILE,
          severity: EButtonSeverity.PRIMARY,
          permission: [APP_PERMISSION.PAYMENT_SHEET.CREATE],
          disabled: selectedCount === 0,
          disabledTooltip:
            selectedCount === 0
              ? 'Select expense, fuel, or vendor outstanding beneficiaries first.'
              : undefined,
        },
      ],
    };
  }
}
