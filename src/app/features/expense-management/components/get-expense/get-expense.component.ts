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
} from '@features/expense-management/config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IExpense } from '@features/expense-management/types/expense.interface';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { GetExpenseDetailComponent } from '../get-expense-detail/get-expense-detail.component';
import {
  getOriginalDataForSelectedRows,
  transformDateFormat,
} from '@shared/utility';
import { APP_CONFIG } from '@core/config';

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

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private originalExpenseData: IExpenseGetBaseResponseDto[] = [];
  private readonly expenseStats = signal<IExpenseGetStatsResponseDto | null>(
    null
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      EXPENSE_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    // this.searchFilterConfig = SEARCH_FILTER_ATTENDANCE_FORM_CONFIG;
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

          this.originalExpenseData = records;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.expenseStats.set(stats);
          this.logger.logUserAction('Expense records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.originalExpenseData = [];
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
        expenseType: record.category,
        expenseAmount: record.amount,
        fileKeys: record.fileKeys,
        transactionType: record.transactionType,
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
      { label: 'Opening Balance', value: stats.balances.openingBalance },
      { label: 'Closing Balance', value: stats.balances.closingBalance },
      { label: 'Total Credit', value: stats.balances.periodCredit },
      { label: 'Total Debit', value: stats.balances.periodDebit },
      { label: 'Period Credit', value: stats.balances.periodCredit },
      { label: 'Period Debit', value: stats.balances.periodDebit },
    ];
  }

  protected handleExpenseTableActionClick(
    event: ITableActionClickEvent<IExpense>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;

    const originalSelectedRows = getOriginalDataForSelectedRows<
      IExpense,
      IExpenseGetBaseResponseDto
    >(selectedRows, this.originalExpenseData, 'id');

    if (actionType === EButtonActionType.VIEW) {
      this.showExpenseDetailsDrawer(originalSelectedRows);
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
      selectedRecord: originalSelectedRows,
      onSuccess: () => {
        this.loadExpenseList();
      },
    };

    if (
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.REJECT ||
      actionType === EButtonActionType.DELETE
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareExpenseRecordDetail(originalSelectedRows);
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
    selectedRows: IExpenseGetBaseResponseDto[]
  ): IConfirmationDialogRecordDetailConfig {
    const [firstRow] = selectedRows;

    const recordDetail = [
      {
        label: 'Employee Name',
        value: `${firstRow.user.firstName} ${firstRow.user.lastName}`,
      },
      {
        label: 'Expense Date',
        value: transformDateFormat(
          firstRow.expenseDate,
          APP_CONFIG.DATE_FORMATS.DEFAULT
        ),
      },
      { label: 'Expense Type', value: firstRow.category },
      { label: 'Amount', value: firstRow.amount },
      { label: 'Expense Description', value: firstRow.description },
      { label: 'Approval Status', value: firstRow.approvalStatus },
    ];
    return {
      details: recordDetail,
    };
  }

  private showExpenseDetailsDrawer(
    rowData: IExpenseGetBaseResponseDto[]
  ): void {
    this.logger.logUserAction('Opening expense details drawer', rowData);

    this.drawerService.showDrawer(GetExpenseDetailComponent, {
      header: `Expense Details`,
      subtitle: `Detailed view of expense`,
      componentData: {
        expense: rowData[0],
      },
    });
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'forceExpense') {
      navigationRoute = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.FORCE];
    } else if (actionName === 'addExpense') {
      navigationRoute = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.ADD];
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
