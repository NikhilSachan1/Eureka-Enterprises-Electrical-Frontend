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
import { LoggerService } from '@core/services';
import {
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
  EDialogType,
  IConfirmationDialogRecordDetailConfig,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IExpenseGetBaseResponseDto,
  IExpenseGetRequestDto,
  IExpenseGetResponseDto,
  IExpenseGetStatsResponseDto,
} from '@features/expense-management/types/expense.dto';
import {
  EXPENSE_ACTION_CONFIG_MAP,
  EXPENSE_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_EXPENSE_FORM_CONFIG,
} from '@features/expense-management/config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IExpense } from '@features/expense-management/types/expense.interface';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetExpenseDetailComponent } from '../get-expense-detail/get-expense-detail.component';
import {
  getMappedValueFromArrayOfObjects,
  transformDateFormat,
} from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { EXPENSE_CATEGORY_DATA } from '@shared/config/static-data.config';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-get-expense',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    MetricsCardComponent,
    DataTableComponent,
  ],
  templateUrl: './get-expense.component.html',
  styleUrl: './get-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe],
})
export class GetExpenseComponent implements OnInit {
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
  private readonly currencyPipe = inject(CurrencyPipe);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly expenseStats = signal<IExpenseGetStatsResponseDto | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      EXPENSE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_EXPENSE_FORM_CONFIG;
  }

  private loadExpenseList(): void {
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
          this.logger.logUserAction('Expense records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.expenseStats.set(null);
          this.logger.logUserAction('Failed to load expense records', error);
        },
      });
  }

  private prepareParamData(): IExpenseGetRequestDto {
    const queryFilterParams =
      this.tableServerSideFilterAndSortService.buildQueryParams<IExpenseGetRequestDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return queryFilterParams;
  }

  private mapTableData(response: IExpenseGetBaseResponseDto[]): IExpense[] {
    return response.map((record: IExpenseGetBaseResponseDto) => {
      return {
        id: record.id,
        expenseDate: record.expenseDate,
        approvalStatus: record.approvalStatus,
        employeeName: `${record.user.firstName} ${record.user.lastName}`,
        employeeCode: record.user.employeeId,
        expenseType: getMappedValueFromArrayOfObjects(
          EXPENSE_CATEGORY_DATA,
          record.category
        ),
        expenseAmount: record.amount,
        fileKeys: record.fileKeys,
        transactionType: record.transactionType,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadExpenseList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.expenseStats();
    if (!stats) {
      return [];
    }

    return [
      { label: 'Total', value: stats.approval.total },
      { label: 'Approved', value: stats.approval.approved },
      { label: 'Pending', value: stats.approval.pending },
      { label: 'Rejected', value: stats.approval.rejected },
      {
        label: 'Opening Balance',
        value: this.currencyPipe.transform(
          stats.balances.openingBalance,
          APP_CONFIG.CURRENCY_CONFIG.DEFAULT
        ) as unknown as number,
      },
      {
        label: 'Closing Balance',
        value: this.currencyPipe.transform(
          stats.balances.closingBalance,
          APP_CONFIG.CURRENCY_CONFIG.DEFAULT
        ) as unknown as number,
      },
      {
        label: 'Total Credit',
        value: this.currencyPipe.transform(
          stats.balances.totalCredit,
          APP_CONFIG.CURRENCY_CONFIG.DEFAULT
        ) as unknown as number,
      },
      {
        label: 'Total Debit',
        value: this.currencyPipe.transform(
          stats.balances.totalDebit,
          APP_CONFIG.CURRENCY_CONFIG.DEFAULT
        ) as unknown as number,
      },
      {
        label: 'Period Credit',
        value: this.currencyPipe.transform(
          stats.balances.periodCredit,
          APP_CONFIG.CURRENCY_CONFIG.DEFAULT
        ) as unknown as number,
      },
      {
        label: 'Period Debit',
        value: this.currencyPipe.transform(
          stats.balances.periodDebit,
          APP_CONFIG.CURRENCY_CONFIG.DEFAULT
        ) as unknown as number,
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

    const dialogTypeMap: Record<string, EDialogType> = {
      [EButtonActionType.APPROVE]: EDialogType.APPROVE,
      [EButtonActionType.REJECT]: EDialogType.REJECT,
      [EButtonActionType.DELETE]: EDialogType.DELETE,
    };

    const dialogType = dialogTypeMap[actionType];

    if (!dialogType) {
      this.logger.warn('Unknown table action:', actionType);
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
    const dialogConfig = this.confirmationDialogService.createDialogConfig(
      actionType,
      EXPENSE_ACTION_CONFIG_MAP,
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );

    this.confirmationDialogService.showConfirmationDialog(
      dialogConfig,
      dialogType
    );
  }

  private prepareExpenseRecordDetail(
    selectedRow: IExpenseGetBaseResponseDto
  ): IConfirmationDialogRecordDetailConfig {
    const recordDetail = [
      {
        label: 'Employee Name',
        value: `${selectedRow.user.firstName} ${selectedRow.user.lastName}`,
      },
      {
        label: 'Expense Date',
        value: transformDateFormat(
          selectedRow.expenseDate,
          APP_CONFIG.DATE_FORMATS.DEFAULT
        ),
      },
      {
        label: 'Expense Type',
        value: getMappedValueFromArrayOfObjects(
          EXPENSE_CATEGORY_DATA,
          selectedRow.category
        ),
      },
      { label: 'Amount', value: selectedRow.amount },
      { label: 'Expense Description', value: selectedRow.description },
      { label: 'Approval Status', value: selectedRow.approvalStatus },
    ];
    return {
      details: recordDetail,
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
          icon: ICONS.ACTIONS.PENCIL,
          actionName: 'reimburseExpense',
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Force Expense',
          icon: ICONS.COMMON.FORCE,
          actionName: 'forceExpense',
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Expense',
          icon: ICONS.COMMON.PLUS,
          actionName: 'addExpense',
        },
      ],
    };
  }
}
