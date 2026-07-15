import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { LoggerService } from '@core/services';
import { AppPermissionService } from '@core/services/app-permission.service';
import { APP_PERMISSION } from '@core/constants';
import { GetExpenseOutstandingComponent } from '@features/centralized-payment-management/expense-payment-management/components/get-expense-outstanding/get-expense-outstanding.component';
import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { GetFuelExpenseOutstandingComponent } from '@features/centralized-payment-management/fuel-expense-payment-management/components/get-fuel-expense-outstanding/get-fuel-expense-outstanding.component';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { PaymentOutstandingSectionComponent } from '@features/centralized-payment-management/shared/components/payment-outstanding-section/payment-outstanding-section.component';
import { EPaymentOutstandingSourceType } from '@features/centralized-payment-management/shared/config/payment-outstanding-source-section.config';
import {
  getPaymentSourceTabAccent,
  getPaymentSourceTabIcon,
  getPaymentSourceTabLabel,
} from '@features/centralized-payment-management/shared/utils/payment-source-tab.util';
import type {
  IPaymentOutstandingSectionOverview,
  IPaymentOutstandingSectionStat,
} from '@features/centralized-payment-management/shared/types/payment-outstanding-section.interface';
import { PAYMENT_SHEET_ACTION_CONFIG_MAP } from '@features/centralized-payment-management/payment-sheet-management/config';
import { GetVendorOutstandingComponent } from '@features/centralized-payment-management/vendor-payment-management/components/get-vendor-outstanding/get-vendor-outstanding.component';
import { IVendorBookPaymentTableRow } from '@features/centralized-payment-management/vendor-payment-management/types/vendor-outstanding.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ICONS } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  EButtonSeverity,
  IPageHeaderConfig,
} from '@shared/types';
import type { IOutstandingBalanceSectionSnapshot } from '../../types/outstanding-balance-summary.interface';

@Component({
  selector: 'app-get-outstanding-balance',
  imports: [
    PageHeaderComponent,
    PaymentOutstandingSectionComponent,
    GetExpenseOutstandingComponent,
    GetFuelExpenseOutstandingComponent,
    GetVendorOutstandingComponent,
  ],
  templateUrl: './get-outstanding-balance.component.html',
  styleUrl: './get-outstanding-balance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetOutstandingBalanceComponent {
  protected readonly sourceType = EPaymentOutstandingSourceType;

  private readonly logger = inject(LoggerService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly activeTabIndex = model(0);

  protected readonly canCreatePaymentSheet = computed(() =>
    this.appPermissionService.hasPermission(APP_PERMISSION.PAYMENT_SHEET.CREATE)
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

  private readonly sectionSnapshots = signal<
    Partial<
      Record<EPaymentOutstandingSourceType, IOutstandingBalanceSectionSnapshot>
    >
  >({});

  protected readonly balanceTabs = computed(() => {
    const canCreate = this.canCreatePaymentSheet();

    return [
      {
        value: EPaymentOutstandingSourceType.EXPENSE,
        label: getPaymentSourceTabLabel(EPaymentOutstandingSourceType.EXPENSE),
        badgeCount: canCreate ? this.selectedExpenseRecords().length : 0,
      },
      {
        value: EPaymentOutstandingSourceType.FUEL_EXPENSE,
        label: getPaymentSourceTabLabel(
          EPaymentOutstandingSourceType.FUEL_EXPENSE
        ),
        badgeCount: canCreate ? this.selectedFuelRecords().length : 0,
      },
      {
        value: EPaymentOutstandingSourceType.VENDOR_PAYMENT,
        label: getPaymentSourceTabLabel(
          EPaymentOutstandingSourceType.VENDOR_PAYMENT
        ),
        badgeCount: canCreate ? this.selectedVendorBookPayments().length : 0,
      },
    ];
  });

  protected readonly sectionOverview = computed(() => [
    this.buildOverviewCard(EPaymentOutstandingSourceType.EXPENSE, 0),
    this.buildOverviewCard(EPaymentOutstandingSourceType.FUEL_EXPENSE, 1),
    this.buildOverviewCard(EPaymentOutstandingSourceType.VENDOR_PAYMENT, 2),
  ]);

  protected readonly totalSelectedCount = computed(
    () =>
      this.selectedExpenseRecords().length +
      this.selectedFuelRecords().length +
      this.selectedVendorBookPayments().length
  );

  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  protected onSectionSummaryChange(
    sourceType: EPaymentOutstandingSourceType,
    snapshot: IOutstandingBalanceSectionSnapshot
  ): void {
    this.sectionSnapshots.update(current => ({
      ...current,
      [sourceType]: snapshot,
    }));
  }

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

  private buildOverviewCard(
    sourceType: EPaymentOutstandingSourceType,
    tabIndex: number
  ): IPaymentOutstandingSectionOverview {
    const accent = getPaymentSourceTabAccent(sourceType);

    return {
      value: sourceType,
      label: getPaymentSourceTabLabel(sourceType),
      icon: getPaymentSourceTabIcon(sourceType),
      accentLight: accent.light,
      accentDark: accent.dark,
      stats: this.buildOverviewStats(sourceType, tabIndex),
    };
  }

  private buildOverviewStats(
    sourceType: EPaymentOutstandingSourceType,
    tabIndex: number
  ): IPaymentOutstandingSectionStat[] {
    const snapshot = this.sectionSnapshots()[sourceType];
    const canCreate = this.canCreatePaymentSheet();
    const selectedCount = canCreate ? this.getSelectedCount(tabIndex) : 0;
    const selectedAmount = canCreate ? this.getSelectedAmount(tabIndex) : 0;

    if (sourceType === EPaymentOutstandingSourceType.VENDOR_PAYMENT) {
      const stats: IPaymentOutstandingSectionStat[] = [
        {
          kind: 'count',
          label: 'Vendors',
          value: snapshot?.totalRecords ?? 0,
        },
        {
          kind: 'currency',
          label: 'To be booked',
          value: snapshot?.totalPendingToBook ?? 0,
          tone: (snapshot?.totalPendingToBook ?? 0) > 0 ? 'to-book' : null,
        },
        {
          kind: 'currency',
          label: 'Booked',
          value: snapshot?.totalNetPayableAmount ?? 0,
          tone: (snapshot?.totalNetPayableAmount ?? 0) > 0 ? 'debit' : null,
        },
      ];

      if (canCreate) {
        stats.push(
          {
            kind: 'count',
            label: 'Selected',
            value: selectedCount,
            dividerBefore: true,
          },
          {
            kind: 'currency',
            label: 'Selected payable',
            value: selectedAmount,
            tone: selectedAmount > 0 ? 'debit' : null,
          }
        );
      }

      return stats;
    }

    const stats: IPaymentOutstandingSectionStat[] = [
      {
        kind: 'count',
        label: 'Employees',
        value: snapshot?.totalRecords ?? 0,
      },
      {
        kind: 'currency',
        label: 'Pending',
        value: snapshot?.totalPendingAmount ?? 0,
        tone: (snapshot?.totalPendingAmount ?? 0) > 0 ? 'debit' : null,
      },
    ];

    if (canCreate) {
      stats.push(
        {
          kind: 'count',
          label: 'Selected',
          value: selectedCount,
          dividerBefore: true,
        },
        {
          kind: 'currency',
          label: 'Selected payable',
          value: selectedAmount,
          tone: selectedAmount > 0 ? 'debit' : null,
        }
      );
    }

    return stats;
  }

  private getSelectedCount(tabIndex: number): number {
    if (tabIndex === 0) {
      return this.selectedExpenseRecords().length;
    }

    if (tabIndex === 1) {
      return this.selectedFuelRecords().length;
    }

    return this.selectedVendorBookPayments().length;
  }

  private getSelectedAmount(tabIndex: number): number {
    if (tabIndex === 0) {
      return this.selectedExpenseRecords().reduce(
        (total, record) => total + Number(record.pendingAmount ?? 0),
        0
      );
    }

    if (tabIndex === 1) {
      return this.selectedFuelRecords().reduce(
        (total, record) => total + Number(record.pendingAmount ?? 0),
        0
      );
    }

    return this.selectedVendorBookPayments().reduce(
      (total, record) => total + Number(record.pendingAmount ?? 0),
      0
    );
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
      showHeaderButton: this.canCreatePaymentSheet(),
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
