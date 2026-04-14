import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
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
import { ExpenseService } from '@features/expense-management/services/expense.service';
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
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IExpenseGetBaseResponseDto,
  IExpenseGetFormDto,
  IExpenseGetResponseDto,
  IExpenseGetStatsResponseDto,
} from '@features/expense-management/types/expense.dto';
import {
  EXPENSE_ACTION_CONFIG_MAP,
  createExpenseTableEnhancedConfig,
  SEARCH_FILTER_EXPENSE_FORM_CONFIG,
} from '@features/expense-management/config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IExpense } from '@features/expense-management/types/expense.interface';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetExpenseDetailComponent } from '../get-expense-detail/get-expense-detail.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '@features/auth-management/services/auth.service';

@Component({
  selector: 'app-get-expense',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    MetricsCardComponent,
    DataTableComponent,
    CurrencyPipe,
  ],
  templateUrl: './get-expense.component.html',
  styleUrl: './get-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class GetExpenseComponent implements OnInit {
  protected readonly ICONS = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly expenseService = inject(ExpenseService);
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

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly expenseStats = signal<IExpenseGetStatsResponseDto | null>(
    null
  );
  protected readonly payNowClosingBalance = signal<number | null>(null);
  protected readonly payNowClosingBalanceAbs = computed(() =>
    Math.abs(this.payNowClosingBalance() ?? 0)
  );
  protected readonly payNowEmployeeId = signal<string | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());
  protected showPayNowButton = computed(
    () =>
      this.appPermissionService.hasPermission(
        APP_PERMISSION.EXPENSE.REIMBURSE
      ) &&
      this.payNowEmployeeId() !== null &&
      (this.payNowClosingBalance() ?? 0) < 0
  );

  ngOnInit(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    this.table = this.dataTableService.createTable(
      createExpenseTableEnhancedConfig(loggedInUserId)
    );
    this.searchFilterConfig = SEARCH_FILTER_EXPENSE_FORM_CONFIG;
  }

  private loadExpenseList(): void {
    this.payNowClosingBalance.set(null);
    this.payNowEmployeeId.set(null);

    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Expense',
      message: 'Please wait while we load the expense...',
    });

    const paramData = this.prepareParamData();

    this.expenseService
      .getExpenseList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IExpenseGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.expenseStats.set(stats);

          const employeeId = paramData.employeeName;

          if (employeeId?.length === 1) {
            this.payNowClosingBalance.set(stats.balances.closingBalance);
            this.payNowEmployeeId.set(employeeId[0]);
          } else {
            this.payNowClosingBalance.set(null);
            this.payNowEmployeeId.set(null);
          }
          this.logger.logUserAction('Expense records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.expenseStats.set(null);
          this.payNowClosingBalance.set(null);
          this.payNowEmployeeId.set(null);
          this.logger.logUserAction('Failed to load expense records', error);
        },
      });
  }

  private prepareParamData(): IExpenseGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IExpenseGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IExpenseGetBaseResponseDto[]): IExpense[] {
    return response.map((record: IExpenseGetBaseResponseDto) => {
      return {
        id: record.id,
        expenseDate: record.expenseDate,
        approvalStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.approvalStatus(),
          record.approvalStatus
        ),
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        employeeCode: record.user.employeeId,
        expenseType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.expenseCategories(),
          record.category
        ),
        expenseAmount: record.amount,
        fileKeys: record.fileKeys,
        transactionType: record.transactionType,
        description: record.description,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadExpenseList();
  }

  protected onPayNowClick(): void {
    const amount = this.payNowClosingBalance();
    const employeeId = this.payNowEmployeeId();
    if (amount === null || employeeId === null || amount >= 0) {
      return;
    }
    void this.routerNavigationService.navigateWithQueryParams(
      [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.REIMBURSE],
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

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.expenseStats();
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
        ],
      },
    ];
  }

  protected handleExpenseTableActionClick(
    event: ITableActionClickEvent<IExpenseGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showExpenseDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditExpense(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadExpenseList();
      },
    };

    if (
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.REJECT
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareExpenseRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      EXPENSE_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareExpenseRecordDetail(
    selectedRow: IExpenseGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Date',
        value: selectedRow.expenseDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Category',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.expenseCategories(),
          selectedRow.category
        ),
      },
      {
        label: 'Amount',
        value: selectedRow.amount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
        metadata: {
          transactionType: selectedRow.transactionType,
        },
      },
      {
        label: 'Payment Mode',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.expensePaymentMethods(),
          selectedRow.paymentMode
        ),
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

  private showExpenseDetailsDrawer(rowData: IExpenseGetBaseResponseDto): void {
    this.logger.logUserAction('Opening expense details drawer', rowData);

    this.drawerService.showDrawer(GetExpenseDetailComponent, {
      header: `Expense Details`,
      subtitle: `Detailed view of expense`,
      componentData: {
        expense: rowData,
      },
    });
  }

  private navigateToEditExpense(expenseId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.EXPENSE,
        ROUTES.EXPENSE.EDIT,
        expenseId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing expense',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'forceExpense') {
      navigationRoute = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.FORCE];
    } else if (actionName === 'addExpense') {
      navigationRoute = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.ADD];
    } else if (actionName === 'reimburseExpense') {
      navigationRoute = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.REIMBURSE];
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
      title: 'Expense Management',
      subtitle: 'Manage expense records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
          label: 'Reimburse Expense',
          icon: ICONS.PAYROLL.WALLET,
          actionName: 'reimburseExpense',
          permission: [APP_PERMISSION.EXPENSE.REIMBURSE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Force Expense',
          icon: ICONS.COMMON.FORCE,
          actionName: 'forceExpense',
          permission: [APP_PERMISSION.EXPENSE.FORCE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Expense',
          icon: ICONS.COMMON.PLUS,
          actionName: 'addExpense',
          permission: [APP_PERMISSION.EXPENSE.ADD],
        },
      ],
    };
  }
}
