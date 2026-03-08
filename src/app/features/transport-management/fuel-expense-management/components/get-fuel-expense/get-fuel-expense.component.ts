import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LoggerService } from '@core/services';
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
  IMetric,
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
  FUEL_EXPENSE_TABLE_ENHANCED_CONFIG,
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
import { DecimalPipe } from '@angular/common';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-fuel-expense',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    DecimalPipe,
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

  protected readonly APP_CONFIG = APP_CONFIG;
  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly fuelExpenseStats =
    signal<IFuelExpenseGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      FUEL_EXPENSE_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_FUEL_EXPENSE_FORM_CONFIG;
  }

  private loadFuelExpenseList(): void {
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
          this.logger.logUserAction('Fuel expense records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.fuelExpenseStats.set(null);
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
        approvalStatus: record.approvalStatus,
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

  // Flat metrics - not used when using grouped layout
  private getMetricCardsData(): IMetric[] {
    return [];
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
        icon: 'pi pi-check-circle',
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
        icon: 'pi pi-wallet',
        metrics: [
          {
            label: 'Opening Balance',
            value: stats.balances.openingBalance,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Closing Balance',
            value: stats.balances.closingBalance,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
        ],
      },
      {
        id: 'transactions',
        title: 'Transactions',
        icon: 'pi pi-arrow-right-arrow-left',
        metrics: [
          {
            label: 'Total Debit',
            value: stats.balances.totalDebit,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Total Credit',
            value: stats.balances.totalCredit,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Period Debit',
            value: stats.balances.periodDebit,
            type: EDataType.CURRENCY,
            format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          },
          {
            label: 'Period Credit',
            value: stats.balances.periodCredit,
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
            approvalStatus: selectedRow.approvalStatus,
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
    return {
      title: 'Fuel Expense Management',
      subtitle: 'Manage fuel expense records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
          label: 'Reimburse Fuel Expense',
          icon: ICONS.ACTIONS.PENCIL,
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
        },
      ],
    };
  }
}
