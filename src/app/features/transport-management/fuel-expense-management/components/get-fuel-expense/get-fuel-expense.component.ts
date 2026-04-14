import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AppPermissionService, LoggerService } from '@core/services';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { TableLazyLoadEvent } from 'primeng/table';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import {
  IFuelExpenseGetBaseResponseDto,
  IFuelExpenseGetFormDto,
  IFuelExpenseGetResponseDto,
  IFuelExpenseGetStatsResponseDto,
} from '../../types/fuel-expense.dto';
import {
  FUEL_EXPENSE_ACTION_CONFIG_MAP,
  createFuelExpenseTableEnhancedConfig,
  SEARCH_FILTER_FUEL_EXPENSE_FORM_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFuelExpense } from '../../types/fuel-expense.interface';
import { APP_CONFIG } from '@core/config';
import { GetFuelExpenseDetailComponent } from '../get-fuel-expense-detail/get-fuel-expense-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AuthService } from '@features/auth-management/services/auth.service';

@Component({
  selector: 'app-get-fuel-expense',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    DecimalPipe,
    CurrencyPipe,
  ],
  templateUrl: './get-fuel-expense.component.html',
  styleUrl: './get-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetFuelExpenseComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);

  private readonly hasAssignedVehicle = signal<boolean | null>(null);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;

  protected isExtremeEfficiencyDelta(
    percent: number | null | undefined,
    deltaKmPerL: number | null | undefined
  ): boolean {
    if (percent !== null && Math.abs(percent ?? 0) > 500) {
      return true;
    }
    if (deltaKmPerL !== null && Math.abs(deltaKmPerL ?? 0) > 200) {
      return true;
    }
    return false;
  }
  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly fuelExpenseStats =
    signal<IFuelExpenseGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());
  protected readonly payNowClosingBalance = signal<number | null>(null);
  protected readonly payNowClosingBalanceAbs = computed(() =>
    Math.abs(this.payNowClosingBalance() ?? 0)
  );
  protected readonly payNowEmployeeId = signal<string | null>(null);
  protected showPayNowButton = computed(
    () =>
      this.appPermissionService.hasPermission(
        APP_PERMISSION.EXPENSE.REIMBURSE
      ) &&
      this.payNowEmployeeId() !== null &&
      (this.payNowClosingBalance() ?? 0) < 0
  );

  ngOnInit(): void {
    this.applyLinkedVehicleFromAppConfiguration();
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createFuelExpenseTableEnhancedConfig(loggedInUserId)
    );
    this.searchFilterConfig = SEARCH_FILTER_FUEL_EXPENSE_FORM_CONFIG;
  }

  private applyLinkedVehicleFromAppConfiguration(): void {
    const linked = this.appConfigurationService.linkedUserVehicleDetail();
    if (linked === null) {
      this.hasAssignedVehicle.set(false);
      return;
    }

    const hasLinkedVehicle =
      !!linked.vehicle && Object.keys(linked.vehicle).length > 0;

    this.hasAssignedVehicle.set(hasLinkedVehicle);
  }

  private loadFuelExpenseList(): void {
    this.payNowClosingBalance.set(null);
    this.payNowEmployeeId.set(null);
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Fuel Expense',
      message: 'Please wait while we load the fuel expense...',
    });

    const paramData = this.prepareParamData();

    this.fuelExpenseService
      .getFuelExpenseList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IFuelExpenseGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.fuelExpenseStats.set(stats);
          const employeeId = paramData.employeeName;

          if (employeeId?.length === 1) {
            this.payNowClosingBalance.set(stats.balances.closingBalance);
            this.payNowEmployeeId.set(employeeId[0]);
          } else {
            this.payNowClosingBalance.set(null);
            this.payNowEmployeeId.set(null);
          }
          this.logger.logUserAction('Fuel expense records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.fuelExpenseStats.set(null);
          this.payNowClosingBalance.set(null);
          this.payNowEmployeeId.set(null);
          this.logger.logUserAction(
            'Failed to load fuel expense records',
            error
          );
        },
      });
  }

  private prepareParamData(): IFuelExpenseGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IFuelExpenseGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IFuelExpenseGetBaseResponseDto[]
  ): IFuelExpense[] {
    return response.map((record: IFuelExpenseGetBaseResponseDto) => {
      return {
        id: record.id,
        fuelFillDate: record.fillDate,
        approvalStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.approvalStatus(),
          record.approvalStatus
        ),
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        employeeCode: record.user.employeeId,
        vehicle: {
          registrationNumber: record.vehicle?.registrationNo ?? '',
          vehicleModel: record.vehicle?.model ?? '',
        },
        fuelAmount: record.fuelAmount,
        fileKeys: record.fileKeys,
        transactionType: record.transactionType,
        description: record.description,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadFuelExpenseList();
  }

  protected onPayNowClick(): void {
    const amount = this.payNowClosingBalance();
    const employeeId = this.payNowEmployeeId();
    if (amount === null || employeeId === null || amount >= 0) {
      return;
    }
    void this.routerNavigationService.navigateWithQueryParams(
      [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.REIMBURSEMENT,
      ],
      {
        employeeName: employeeId,
        expenseAmount: Math.abs(amount),
      }
    );
  }

  private balanceAmountSubtitle(amount: number): string {
    const n = Number(amount);
    if (!Number.isFinite(n) || n === 0) {
      return 'No net advance or amount due';
    }
    if (n > 0) {
      return 'Paid extra';
    }
    if (this.authService.isActiveRoleManagerial()) {
      return 'Payable to employee';
    }
    return 'Receivable from company';
  }

  // Grouped metrics layout
  private getMetricGroups(): IMetricGroup[] {
    const stats = this.fuelExpenseStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'approval',
        title: 'Approval Status',
        icon: ICONS.ACTIONS.CHECK_CIRCLE,
        metrics: [
          { label: 'Total', value: stats.approval.total },
          { label: 'Approved', value: stats.approval.approved },
          { label: 'Pending', value: stats.approval.pending },
          { label: 'Rejected', value: stats.approval.rejected },
        ],
      },
      {
        id: 'balance',
        title: 'Balance',
        icon: ICONS.PAYROLL.WALLET,
        metrics: [
          {
            label: 'Opening Balance',
            value: Math.abs(stats.projectedBalances.openingBalance),
            subtitle: this.balanceAmountSubtitle(
              stats.projectedBalances.openingBalance
            ),
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Closing Balance',
            value: Math.abs(stats.projectedBalances.closingBalance),
            subtitle: this.balanceAmountSubtitle(
              stats.projectedBalances.closingBalance
            ),
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Approved Opening Balance',
            value: Math.abs(stats.balances.openingBalance),
            subtitle: this.balanceAmountSubtitle(stats.balances.openingBalance),
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Approved Closing Balance',
            value: Math.abs(stats.balances.closingBalance),
            subtitle: this.balanceAmountSubtitle(stats.balances.closingBalance),
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
        ],
      },
      {
        id: 'transactions',
        title: 'Transactions',
        icon: ICONS.COMMON.ARROW_RIGHT_LEFT,
        metrics: [
          {
            label: 'Total Debit',
            value: stats.projectedBalances.periodDebit,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Total Credit',
            value: stats.projectedBalances.periodCredit,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Approved Debit',
            value: stats.balances.periodDebit,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Total Petro Card Debit Approved',
            value: stats.balances.totalPetroCardDebitApproved,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Total Petro Card Debit',
            value: stats.balances.totalPetroCardExpense,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
        ],
      },
    ];
  }

  protected handleFuelExpenseTableActionClick(
    event: ITableActionClickEvent<IFuelExpenseGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showFuelExpenseDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditFuelExpense(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadFuelExpenseList();
      },
    };

    if (
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.REJECT
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareFuelExpenseRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      FUEL_EXPENSE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareFuelExpenseRecordDetail(
    selectedRow: IFuelExpenseGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Date',
        value: selectedRow.fillDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Amount',
        value: selectedRow.fuelAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        metadata: {
          transactionType: selectedRow.transactionType,
        },
      },
      {
        label: 'Payment Mode',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.fuelExpensePaymentMethods(),
          selectedRow.paymentMode
        ),
      },
      {
        label: 'Odometer',
        value: selectedRow.odometerKm,
        suffix: 'km',
        type: EDataType.NUMBER,
        format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
      },
      {
        label: 'Fuel',
        value: selectedRow.fuelLiters,
        suffix: 'L',
        type: EDataType.NUMBER,
        format: APP_CONFIG.NUMBER_FORMATS.FLEXIBLE_DECIMALS,
      },
      {
        label: 'Attachment(s)',
        value: selectedRow.fileKeys,
        type: EDataType.ATTACHMENTS,
      },
    ];
    return {
      details: [
        {
          status: {
            entryType: selectedRow.expenseEntryType,
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.approvalStatus(),
              selectedRow.approvalStatus
            ),
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.user.firstName} ${selectedRow.user.lastName}`,
        subtitle: selectedRow.user.employeeId,
      },
    };
  }

  private showFuelExpenseDetailsDrawer(
    rowData: IFuelExpenseGetBaseResponseDto
  ): void {
    this.logger.logUserAction('Opening fuel expense details drawer', rowData);

    this.drawerService.showDrawer(GetFuelExpenseDetailComponent, {
      header: `Fuel Expense Details`,
      subtitle: `Detailed view of fuel expense`,
      componentData: {
        fuelExpense: rowData,
      },
    });
  }

  private navigateToEditFuelExpense(fuelExpenseId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.EDIT,
        fuelExpenseId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing fuel expense',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'forceFuelExpense') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.FORCE,
      ];
    } else if (actionName === 'addFuelExpense') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.ADD,
      ];
    } else if (actionName === 'reimburseFuelExpense') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.REIMBURSEMENT,
      ];
    }
    const success =
      this.routerNavigationService.navigateToRoute(navigationRoute);

    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for header button',
        navigationRoute
      );
    }
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const noAssignedVehicle = this.hasAssignedVehicle() === false;

    return {
      title: 'Fuel Expense Management',
      subtitle: 'Manage fuel expense records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
          label: 'Reimburse Fuel Expense',
          icon: ICONS.PAYROLL.WALLET,
          actionName: 'reimburseFuelExpense',
          permission: [APP_PERMISSION.FUEL_EXPENSE.REIMBURSE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Force Fuel Expense',
          icon: ICONS.COMMON.FORCE,
          actionName: 'forceFuelExpense',
          permission: [APP_PERMISSION.FUEL_EXPENSE.FORCE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Fuel Expense',
          icon: ICONS.COMMON.PLUS,
          actionName: 'addFuelExpense',
          permission: [APP_PERMISSION.FUEL_EXPENSE.ADD],
          disabled: noAssignedVehicle,
          disabledTooltip: noAssignedVehicle
            ? 'You have no vehicle assigned. Fuel expense can only be added when at least one vehicle is assigned to you.'
            : undefined,
        },
      ],
    };
  }
}
